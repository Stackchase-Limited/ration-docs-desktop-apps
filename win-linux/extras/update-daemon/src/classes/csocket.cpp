/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#include "csocket.h"
#include <future>
#include <sstream>

#ifdef _WIN32
# define _WINSOCK_DEPRECATED_NO_WARNINGS
# ifndef UNICODE
#  define UNICODE 1
# endif
# ifndef WIN32_LEAN_AND_MEAN
#  define WIN32_LEAN_AND_MEAN
# endif
# include <Windows.h>
# include <winsock2.h>
# include <sys/types.h>
# include <io.h>
# define sleep(ms) Sleep(ms)
# define close_socket(a) closesocket(a)
#else
# include <unistd.h>
# include <errno.h>
# include <fcntl.h>
# include <stdlib.h>
# include <string.h>
# include <sys/file.h>
# include <sys/socket.h>
# include <sys/un.h>
# include <netinet/in.h>
# include <arpa/inet.h>
# define SD_BOTH SHUT_RDWR
# define sleep(ms) usleep(ms*1000)
# define close_socket(a) close(a)
  typedef int SOCKET;
#endif

#define INADDR "127.0.0.1\0"
#define RETRIES_DELAY_MS 4000
#define BUFFSIZE 1024

typedef struct sockaddr_in SockAddr;

/* The address itself is not present on this host's loopback - as opposed to being in
   use by somebody else, which is what EADDRINUSE says. See the note in initSocket. */
static bool addr_not_available()
{
#ifdef _WIN32
    return WSAGetLastError() == WSAEADDRNOTAVAIL;
#else
    return errno == EADDRNOTAVAIL;
#endif
}

static unsigned long inetAddrFromUserId()
{
#ifdef _WIN32
    return inet_addr(INADDR);
#else
    uint16_t uid = uint16_t(getuid() - 1000);
    char addr[14];
    snprintf(addr, sizeof(addr), "127.%d.%d.1", (uid >> 8) & 0xff, uid & 0xff);
    return inet_addr(addr);
#endif
}

#ifndef _WIN32
/* #1710: the single-instance socket (use_unique_addr) used to be UDP on loopback only.
   A loopback address belongs to a network namespace, and Flatpak without the network
   permission (--unshare=network) runs every `flatpak run` in a namespace of its own, so
   each launch bound the port in its own namespace, called itself the primary instance
   and opened a new window instead of a tab. The same holds for any sandbox that
   unshares the network. A file-system socket is reachable from every process that sees
   the file, so where a per-user runtime folder exists the instance socket lives there:
   $XDG_RUNTIME_DIR, or under Flatpak $XDG_RUNTIME_DIR/app/$FLATPAK_ID, the folder Flatpak
   shares between all instances of one app (the rest of the sandbox's runtime folder is
   private to each instance). Without such a folder this returns "" and the UDP socket is
   used as before. */
static std::string instanceSocketPath(int port)
{
    const char *run_dir = getenv("XDG_RUNTIME_DIR");
    if (!run_dir || !*run_dir)
        return "";
    std::string dir(run_dir);
    const char *app_id = getenv("FLATPAK_ID");
    if (app_id && *app_id) {
        if (strchr(app_id, '/'))
            return "";
        dir += std::string("/app/") + app_id;
    }
    if (access(dir.c_str(), W_OK) != 0)
        return "";
    std::string path = dir + "/desktopeditors-instance-" + std::to_string(port);
    if (path.size() >= sizeof(((struct sockaddr_un*)nullptr)->sun_path))
        return "";
    return path;
}
#endif

static bool initSocket(u_short port, SOCKET &tmpd, SockAddr &addr, int &ret, std::string &error, bool use_unique_addr)
{
#ifdef _WIN32
    WSADATA wsaData = {0};
    int iResult = 0;
    iResult = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (iResult != 0) {
        error = "Init socket: WSAStartup failed!";
        return false;
    }
    tmpd = INVALID_SOCKET;
    if ((tmpd = socket(AF_INET, SOCK_DGRAM, 0)) == INVALID_SOCKET) {
#else
    tmpd = -1;
    if ((tmpd = socket(AF_INET, SOCK_DGRAM | SOCK_CLOEXEC, 0)) < 0) {
#endif
        error = "Init socket: socket not valid!";
        return false;
    }
    memset(&addr, 0, sizeof(SockAddr));
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = use_unique_addr ? inetAddrFromUserId() : inet_addr(INADDR);
    addr.sin_port = htons(port);
    ret = ::bind(tmpd, (struct sockaddr*)&addr, sizeof(addr));

    /* #2434: inetAddrFromUserId() derives 127.<uid>.1 so that two users on one machine
       do not fight over the instance port. Linux puts the whole of 127.0.0.0/8 on lo, so
       any address in it binds. FreeBSD - and so the Linuxulator, which uses the FreeBSD
       network stack - configures only 127.0.0.1 on lo0, so every uid but 1000 fails this
       bind with EADDRNOTAVAIL.

       That failure used to be indistinguishable from EADDRINUSE to the caller, so the
       application decided it was a second instance, tried to hand its arguments to a
       primary that does not exist, and exited 0 with no window and nothing printed.

       Fall back to 127.0.0.1, which exists everywhere. This is done here rather than in
       the callers so that the receiver and the sender cannot end up on different
       addresses. It costs per-user separation on such a host - the behaviour there is
       one shared instance, as it was before the unique address was introduced - which is
       a great deal better than not starting. */
    if (ret != 0 && use_unique_addr && addr.sin_addr.s_addr != inet_addr(INADDR) && addr_not_available()) {
        addr.sin_addr.s_addr = inet_addr(INADDR);
        ret = ::bind(tmpd, (struct sockaddr*)&addr, sizeof(addr));
    }
    return true;
}

class CSocket::CSocketPrv
{
public:
    CSocketPrv();
    ~CSocketPrv();

    bool createSocket(u_short port);
    bool connectToSocket(u_short port);
#ifndef _WIN32
    int  createInstanceSocket();
    bool connectToInstanceSocket();
    std::string instance_path;   // non-empty: the instance socket is this file-system socket
    int lock_fd = -1;            // held by the primary instance for as long as it runs
#endif
    void startReadMessages();
    void closeSocket(SOCKET &socket);
    void postError(const char*);

    SOCKET sender_fd = -1,
           receiver_fd = -1;

    FnVoidData m_received_callback = nullptr;
    FnVoidCharPtr m_error_callback = nullptr;
    std::future<void> m_future;
    int m_sender_port;
    std::atomic_bool m_run,
                     m_use_unique_addr,
                     m_socket_created;
};

CSocket::CSocketPrv::CSocketPrv()
{
    m_run = true;
    m_socket_created = false;
}

CSocket::CSocketPrv::~CSocketPrv()
{}

#ifndef _WIN32
/* 1 = primary (receiver_fd is bound), 0 = another instance is primary, -1 = could not use
   the file-system socket at all (fall back to UDP). Being primary is holding the lock:
   flock is released by the kernel when the process dies, so a crashed primary leaves no
   instance behind, only a socket file the next primary replaces. */
int CSocket::CSocketPrv::createInstanceSocket()
{
    int fd = open((instance_path + ".lock").c_str(), O_RDWR | O_CREAT | O_CLOEXEC, 0600);
    if (fd < 0)
        return -1;
    if (flock(fd, LOCK_EX | LOCK_NB) != 0) {
        int err = errno;
        close(fd);
        return err == EWOULDBLOCK ? 0 : -1;
    }
    unlink(instance_path.c_str());
    struct sockaddr_un addr;
    memset(&addr, 0, sizeof(addr));
    addr.sun_family = AF_UNIX;
    strncpy(addr.sun_path, instance_path.c_str(), sizeof(addr.sun_path) - 1);
    SOCKET tmpd = socket(AF_UNIX, SOCK_DGRAM | SOCK_CLOEXEC, 0);
    if (tmpd < 0 || ::bind(tmpd, (struct sockaddr*)&addr, sizeof(addr)) != 0) {
        if (tmpd >= 0)
            close_socket(tmpd);
        close(fd);
        return -1;
    }
    receiver_fd = tmpd;
    lock_fd = fd;
    return 1;
}

bool CSocket::CSocketPrv::connectToInstanceSocket()
{
    struct sockaddr_un addr;
    memset(&addr, 0, sizeof(addr));
    addr.sun_family = AF_UNIX;
    strncpy(addr.sun_path, instance_path.c_str(), sizeof(addr.sun_path) - 1);
    SOCKET tmpd = socket(AF_UNIX, SOCK_DGRAM | SOCK_CLOEXEC, 0);
    if (tmpd < 0)
        return false;
    // the primary takes the lock a moment before it binds: give a starting primary 2 s
    for (int i = 0; i < 20; i++) {
        if (::connect(tmpd, (struct sockaddr*)&addr, sizeof(addr)) == 0) {
            sender_fd = tmpd;
            return true;
        }
        if (errno != ENOENT && errno != ECONNREFUSED)
            break;
        sleep(100);
    }
    close_socket(tmpd);
    return false;
}
#endif

bool CSocket::CSocketPrv::createSocket(u_short port)
{
#ifndef _WIN32
    if (!instance_path.empty()) {
        int res = createInstanceSocket();
        if (res >= 0) {
            if (res == 0)
                postError("Could not create socket!");
            return res == 1;
        }
        instance_path.clear();
    }
#endif
    int ret;
    SOCKET tmpd;
    SockAddr addr;
    std::string error;
    if (!initSocket(port, tmpd, addr, ret, error, m_use_unique_addr)) {
        postError(error.c_str());
        return false;
    }

    if (ret == 0) {
        receiver_fd = tmpd;
        return true;
    }
    close_socket(tmpd);
    postError("Could not create socket!");
    return false;
}

bool CSocket::CSocketPrv::connectToSocket(u_short port)
{
#ifndef _WIN32
    if (!instance_path.empty()) {
        if (connectToInstanceSocket())
            return true;
        postError("Could not connect to socket!");
        return false;
    }
#endif
    int ret;
    SOCKET tmpd;
    SockAddr addr;
    std::string error;
    if (!initSocket(port, tmpd, addr, ret, error, m_use_unique_addr)) {
        postError(error.c_str());
        return false;
    }

    if (ret != 0) {
#ifdef _WIN32
        if (WSAGetLastError() == WSAEADDRINUSE) {
#else
        if (errno == EADDRINUSE) {
#endif
            ret = ::connect(tmpd, (struct sockaddr*)&addr, sizeof(SockAddr));
            if (ret == 0) {
                sender_fd = tmpd;
                return true;
            }
        }
    }
    close_socket(tmpd);
    postError("Could not connect to socket!");
    return false;
}

void CSocket::CSocketPrv::startReadMessages()
{
    while (m_run) {
        char rcvBuf[BUFFSIZE] = {0};
        int ret_data = recv(receiver_fd, rcvBuf, BUFFSIZE, 0); // Receive the string data
        if (ret_data != BUFFSIZE) {
            if (ret_data < 0) {
                // FAILURE
                postError("Start read messages: error while accessing socket!");
            } else {
                // Connection closed.
            }
        } else {
            // SUCCESS
            if (m_received_callback)
                m_received_callback(rcvBuf, strlen(rcvBuf));
        }
    }
    // Dropped out of daemon loop.
}

void CSocket::CSocketPrv::closeSocket(SOCKET &socket)
{
    if (socket >= 0) {
        shutdown(socket, SD_BOTH);
        close_socket(socket);
        socket = -1;
    }
}

void CSocket::CSocketPrv::postError(const char *error)
{
    if (m_error_callback)
        m_error_callback(error);
}

CSocket::CSocket(int sender_port, int receiver_port, bool retry_connect, bool use_unique_addr) :
    pimpl(new CSocketPrv)
{
    pimpl->m_use_unique_addr = use_unique_addr;
    pimpl->m_sender_port = sender_port;
#ifndef _WIN32
    if (use_unique_addr)
        pimpl->instance_path = instanceSocketPath(receiver_port > 0 ? receiver_port : sender_port);
#endif
    if (receiver_port <= 0)
        return;
    pimpl->m_socket_created = pimpl->createSocket(receiver_port);
    pimpl->m_future = std::async(std::launch::async, [=]() {
        while (retry_connect && pimpl->m_run && !pimpl->m_socket_created) {
            pimpl->postError("Unable to create socket, retrying after 4 seconds.");
            sleep(RETRIES_DELAY_MS);
            pimpl->m_socket_created = pimpl->createSocket(receiver_port);
        }
        if (pimpl->m_socket_created)
            pimpl->startReadMessages();
    });
}

CSocket::~CSocket()
{
    pimpl->m_run = false;
    pimpl->closeSocket(pimpl->sender_fd);
    pimpl->closeSocket(pimpl->receiver_fd);
    if (pimpl->m_future.valid())
        pimpl->m_future.wait();
#ifndef _WIN32
    if (pimpl->lock_fd >= 0) {
        unlink(pimpl->instance_path.c_str());
        close(pimpl->lock_fd);
    }
#endif

    delete pimpl;
#ifdef _WIN32
    WSACleanup();
#endif
}

bool CSocket::isPrimaryInstance()
{
    return pimpl->m_socket_created;
}

bool CSocket::sendMessage(void *data, size_t size)
{
    if (!data || size > BUFFSIZE - 1)
        return false;

    if (!pimpl->connectToSocket(pimpl->m_sender_port))
        return false;

    char client_arg[BUFFSIZE] = {0};
    memcpy(client_arg, data, size);
#ifdef _WIN32
    int ret_data = send(pimpl->sender_fd, client_arg, BUFFSIZE, 0); // Send the string
#else
    // MSG_CONFIRM is for UDP only
    int ret_data =(int)send(pimpl->sender_fd, client_arg, BUFFSIZE, pimpl->instance_path.empty() ? MSG_CONFIRM : 0);
#endif
    if (ret_data != BUFFSIZE) {
        if (ret_data < 0) {
            pimpl->postError("Send message error: could not send device address to daemon!");
        } else {
            pimpl->postError("Send message error: could not send device address to daemon completely!");
        }
        pimpl->closeSocket(pimpl->sender_fd);
        return false;
    }
    pimpl->closeSocket(pimpl->sender_fd);
    return true;
}

bool CSocket::sendMessage(int cmd, const tstring &param1, const tstring &param2)
{
    tstring str = std::to_tstring(cmd) + _T("|") + (param1.empty() ? _T("null") : param1) +
                  _T("|") + (param2.empty() ? _T("null") : param2);
    size_t sz = str.size() * sizeof(str.front());
    return sendMessage((void*)str.c_str(), sz);
}

void CSocket::onMessageReceived(FnVoidData callback)
{
    pimpl->m_received_callback = callback;
}

void CSocket::onError(FnVoidCharPtr callback)
{
    pimpl->m_error_callback = callback;
}

int CSocket::parseMessage(void *data, std::vector<tstring> &params)
{
    tstring str((const tchar*)data), tmp;
    tstringstream wss(str);
    while (std::getline(wss, tmp, _T('|')))
        params.push_back(tmp == _T("null") ? _T("") : std::move(tmp));
    return (int)params.size();
}
