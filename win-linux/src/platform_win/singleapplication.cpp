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

#include <windowsx.h>
#include "cascapplicationmanagerwrapper.h"
#include "singleapplication.h"
#include "defines.h"
#include <QThread>

#define RECEIVER_WINDOW WINDOW_CLASS_NAME
#define RETRIES_COUNT 10
#define RETRIES_DELAY_MS 500


SingleApplication::SingleApplication(int &argc, char *argv[]) :
    QApplication(argc, argv),
    m_isPrimary(false)
{
    /* #2189: the application closed itself the moment it started, every time, with no
       message at all. GetLastError() is thread-local and sticky - CreateMutex does not
       clear it when it creates the mutex fresh, it only *sets* ERROR_ALREADY_EXISTS when
       the mutex was already there. So whatever last failed on this thread is still in it,
       and reading it without clearing it first asks the wrong question.

       ERROR_ALREADY_EXISTS is exactly the value most likely to be sitting there: it is
       what CreateDirectory leaves behind for a directory that is already present, and Qt
       touches its settings and cache directories while QApplication is constructed - which
       happens in the initialiser list, just above. So on a machine where that ordering
       falls out the wrong way, the only running instance decided it was a second one,
       spent five seconds hunting for a receiver window that does not exist, and returned 0
       from main.

       Clear the error first and check the handle, so this asks only what it means to ask.
       A CreateMutex that fails outright is treated as primary: without the mutex we cannot
       know, and starting is the recoverable answer. */
    SetLastError(ERROR_SUCCESS);
    m_hMutex = CreateMutex(NULL, FALSE, TEXT(APP_MUTEX_NAME));
    const DWORD createResult = GetLastError();
    if (m_hMutex == NULL || createResult != ERROR_ALREADY_EXISTS) {
        m_isPrimary = true;
        startPrimary();
    }
}

SingleApplication::~SingleApplication()
{
    /* Closed whether or not we are primary - a secondary instance opened a handle to the
       same mutex and used to leak it. */
    if (m_hMutex != nullptr)
        CloseHandle(m_hMutex);

    if (m_hWnd)
        DestroyWindow(m_hWnd);
}

bool SingleApplication::isPrimary() const
{
    return m_isPrimary;
}

bool SingleApplication::sendMessage(const QByteArray &message)
{
    if (m_isPrimary)
        return false;

    HWND hwnd = NULL;
    int retries = RETRIES_COUNT;
    do {
        QThread::msleep(RETRIES_DELAY_MS);
        hwnd = FindWindow(RECEIVER_WINDOW, NULL);
    } while (retries-- > 0 && hwnd == NULL);

    if (hwnd != NULL) {
        QString msg(message);
        wchar_t *cm_line = new wchar_t[msg.length() + 1];
        msg.toWCharArray(cm_line);
        cm_line[msg.length()] = '\0';

        COPYDATASTRUCT MyCDS = {1};
        MyCDS.cbData = sizeof(WCHAR) * (wcslen(cm_line) + 1);
        MyCDS.lpData = cm_line;
        SendMessage(hwnd, WM_COPYDATA, WPARAM(0), LPARAM((LPVOID)&MyCDS));
        delete[] cm_line;
        return true;
    }
    return false;
}

void SingleApplication::startPrimary()
{
    HINSTANCE hInstance = GetModuleHandle(nullptr);
    WNDCLASSEX wcx{sizeof(WNDCLASSEX)};
    wcx.hInstance = hInstance;
    wcx.lpfnWndProc = WndProc;
    wcx.lpszClassName = RECEIVER_WINDOW;
    RegisterClassEx(&wcx);

    m_hWnd = CreateWindowEx(0, RECEIVER_WINDOW, nullptr, 0, 0, 0, 0, 0, HWND_MESSAGE, nullptr, hInstance, nullptr);
    SetWindowLongPtr(m_hWnd, GWLP_USERDATA, reinterpret_cast<LONG_PTR>(this));
}

void SingleApplication::invokeSignal(const QString &data)
{
    emit receivedMessage(data.toUtf8());
}

LRESULT SingleApplication::WndProc(HWND hWnd, UINT msg, WPARAM wParam, LPARAM lParam)
{
    SingleApplication *app = reinterpret_cast<SingleApplication*>(GetWindowLongPtr(hWnd, GWLP_USERDATA));
    if (!app)
        return DefWindowProc(hWnd, msg, wParam, lParam);

    switch (msg) {
    case WM_COPYDATA: {
        COPYDATASTRUCT* pcds = (COPYDATASTRUCT*)lParam;
        if (pcds->dwData == 1 && pcds->lpData)
            QMetaObject::invokeMethod(app, "invokeSignal", Qt::QueuedConnection, Q_ARG(QString, QString::fromWCharArray((WCHAR*)pcds->lpData)));
        break;
    }
    case UM_INSTALL_UPDATE: {
        QTimer::singleShot(500, []() {
            AscAppManager::closeAppWindows();
        });
        break;
    }
    default:
        break;
    }
    return DefWindowProc(hWnd, msg, wParam, lParam);
}
