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

#ifdef _WIN32
# include "platform_win/singleapplication.h"
#else
# include <gtk/gtk.h>
# include "platform_linux/singleapplication.h"
# include "components/cmessage.h"
# include <unistd.h>
#endif
#include "cascapplicationmanagerwrapper.h"
#include "defines.h"
#include "clangater.h"
#include "clogger.h"
#include "version.h"
#include "utils.h"
#include "chelp.h"
#include "common/File.h"
#include <QStyleFactory>
#include <QGuiApplication>
#include <QFileInfo>
#include <cstdio>


int main( int argc, char *argv[] )
{
#ifdef _WIN32
    Core_SetProcessDpiAwareness();
    Utils::setAppUserModelId();
    WCHAR * cm_line = GetCommandLine();
    InputArgs::init(cm_line);
    if ( InputArgs::contains(L"--assoc") ) {
        return 0;
    }
#else
    /* #2105: the line below forces the xcb platform plugin, and on a Wayland session
       with no X display there is nothing for it to connect to - the process died with a
       segmentation fault before Qt got as far as saying so.

       This is a limitation, not a bug we can fix here, and it is worth being plain about
       it: the shipped Qt carries no wayland platform plugin (the reporter's own log lists
       what is there - eglfs, linuxfb, minimal, minimalegl, offscreen, vnc, xcb), and the
       in-process GTK file dialogs are X11-only, which is what #2168 was about. Running
       natively on Wayland is a port, not a flag.

       What we can do is say so instead of crashing. XWayland sets DISPLAY, so a Wayland
       session that has it is unaffected and still takes the xcb path below; only the
       case that was already doomed changes, from a segfault to a sentence. */
    if ( Utils::isWaylandSession() && qgetenv("DISPLAY").isEmpty() ) {
        fputs("onlyoffice: this is a Wayland session and no X display is available.\n"
              "These editors need X11, either directly or through XWayland: the bundled Qt\n"
              "has no wayland platform plugin, and the file dialogs are X11-only.\n"
              "Start XWayland, or use an X11 session.\n", stderr);
        return 1;
    }
    qputenv("QT_QPA_PLATFORM", "xcb");
    qputenv("GDK_BACKEND", "x11");
    InputArgs::init(argc, argv);
    if (geteuid() == 0) {
        CMessage::warning(nullptr, WARNING_LAUNCH_WITH_ADMIN_RIGHTS);
        return 0;
    }
    if ( InputArgs::contains(L"--set-instapp-port") ) {
        Utils::setInstAppPort(std::stoi(InputArgs::argument_value(L"--set-instapp-port")));
        return 0;
    }
#endif
#ifdef QT_VERSION_6
    qputenv("QT_ENABLE_HIGHDPI_SCALING", "0");
#else
    QCoreApplication::setAttribute(Qt::AA_DisableHighDpiScaling);
#endif
    /* #2274: the virtual keyboard input context is a Qt Quick plugin, and Qt Quick
       resolves `import QtQuick 2.x` through the QML import path - which Qt compiles in
       as the path on the machine that built it, and which means nothing on a user's
       system. Point it at the qml tree deployed beside the executable.

       This has to happen before QApplication is constructed: Qt instantiates platform
       input context plugins during that construction, so an import path set afterwards
       is set too late to matter. GetProcessDirectory is used rather than
       QCoreApplication::applicationDirPath for the same reason - there is no
       application yet.

       Nothing here forces the plugin on. Qt loads it only when QT_IM_MODULE names it;
       what this fixes is that when a user does ask for it, it now has the imports it
       needs instead of failing at the first one. */
    const QString sQmlDir = QString::fromStdWString(NSFile::GetProcessDirectory()) + "/qml";
    if ( QFileInfo(sQmlDir).isDir() )
        qputenv("QML2_IMPORT_PATH", sQmlDir.toUtf8());

    QCoreApplication::setAttribute(Qt::AA_Use96Dpi);
    QCoreApplication::setApplicationName(QString::fromUtf8(WINDOW_NAME));
    QApplication::setApplicationDisplayName(QString::fromUtf8(WINDOW_NAME));
#ifdef __linux
    /* #2397: tell Qt which desktop entry this application is, so a panel can tie the
       window back to it and show the right icon.

       On Wayland this is what Qt reports as the xdg-shell app_id, and a panel has nothing
       else to match on - there is no WM_CLASS to fall back to as there is under X11. So
       without it the window is anonymous and the panel shows a placeholder, which is what
       the report describes on a Wayland session. The desktop entry itself is fine: it has
       carried StartupWMClass all along, and that key is an X11 mechanism the compositor
       never sees.

       DESKTOP_FILE_NAME already existed for the DBus activation call in
       singleapplication.cpp; it was simply never given to Qt. */
    QGuiApplication::setDesktopFileName(QString::fromUtf8(DESKTOP_FILE_NAME));
#endif

    QString user_data_path = Utils::getUserPath() + APP_DATA_PATH;
    auto setup_paths = [&user_data_path](CAscApplicationManager * manager) {
#ifdef _WIN32
        QString common_data_path = Utils::getAppCommonPath();
        if ( !common_data_path.isEmpty() ) {
            manager->m_oSettings.SetUserDataPath(common_data_path.toStdWString());
            manager->m_oSettings.user_templates_path = (common_data_path + "/templates").toStdWString();

            Utils::makepath(user_data_path.append("/data"));
            manager->m_oSettings.cookie_path = (user_data_path + "/cookie").toStdWString();
            manager->m_oSettings.recover_path = (user_data_path + "/recover").toStdWString();
            manager->m_oSettings.fonts_cache_info_path = (user_data_path + "/fonts").toStdWString();

            Utils::makepath(QString().fromStdWString(manager->m_oSettings.fonts_cache_info_path));
        } else
#else
#endif
        {
            manager->m_oSettings.SetUserDataPath(user_data_path.toStdWString());
        }
        std::wstring app_path = NSFile::GetProcessDirectory();
        manager->m_oSettings.spell_dictionaries_path    = app_path + L"/dictionaries";
        manager->m_oSettings.file_converter_path        = app_path + L"/converter";
        manager->m_oSettings.recover_path               = (user_data_path + "/recover").toStdWString();
        manager->m_oSettings.user_plugins_path          = (user_data_path + "/sdkjs-plugins").toStdWString();
        manager->m_oSettings.local_editors_path         = app_path + L"/editors/web-apps/apps/api/documents/index.html";
        manager->m_oSettings.system_templates_path      = app_path  + L"/converter/templates";
        manager->m_oSettings.additional_fonts_folder.push_back(app_path + L"/fonts");
        manager->m_oSettings.country = Utils::systemLocationCode().toStdString();
        manager->m_oSettings.connection_error_path      = app_path + L"/editors/webext/noconnect.html";
    };

    if ( InputArgs::contains(L"--version") ) {
        qWarning() << VER_PRODUCTNAME_STR << "ver." << VER_FILEVERSION_STR;
        return 0;
    } else
    if ( InputArgs::contains(L"--help") ) {
        CHelp::out();
        return 0;
    }
    if ( InputArgs::contains(L"--updates-reset") ) {
        GET_REGISTRY_USER(reg_user)
        reg_user.beginGroup("Updates");
        reg_user.remove("");
        reg_user.endGroup();
        reg_user.remove("autoUpdateMode");
    }
    if ( InputArgs::contains(L"--geometry=default") ) {
        GET_REGISTRY_USER(reg_user)
        reg_user.remove("maximized");
        reg_user.remove("position");
    }
    if ( InputArgs::contains(L"--lock-portals") ) {
        GET_REGISTRY_USER(reg_user)
        reg_user.setValue("lockPortals", true);
    } else
    if ( InputArgs::contains(L"--unlock-portals") ) {
        GET_REGISTRY_USER(reg_user)
        reg_user.remove("lockPortals");
    }

    SingleApplication app(argc, argv);

    if ( !app.isPrimary() ) {
        QString _out_args;
        auto _args = InputArgs::arguments();
        if (_args.size() > 0) {
            foreach (auto w_arg, _args) {
                const QString arg = QString::fromStdWString(w_arg);
                if ( arg.startsWith("--new:") )
                    _out_args.append(arg).append(";");
                else
                if ( arg.mid(0,2) != "--" )
                    _out_args.append(arg + ";");
            }
        }
        bool res = app.sendMessage(_out_args.toUtf8());
        if ( res ) {
            CLogger::log("The instance is not primary and will be closed. Parameter sending status: 1");
            return 0;
        }

        /* #2434: we were told we are not the primary instance, but there is nobody
           there to hand the arguments to. Exiting 0 here is how the application came
           to vanish after Qt had initialised, showing no window and printing nothing -
           the log line went to the log file, which is not where somebody watching a
           terminal is looking. Whatever the cause (see csocket.cpp for one: a loopback
           address that does not exist on this host), the user asked for an editor, so
           carry on and give them one rather than disappearing. A second window is a
           visible, recoverable outcome; a silent exit is neither. */
        CLogger::log("The instance is not primary, but no primary instance answered. Continuing anyway.");
        fputs("onlyoffice: no primary instance answered; starting a new one.\n", stderr);
    }

    app.setAttribute(Qt::AA_UseHighDpiPixmaps);
    app.setStyle(QStyleFactory::create("Fusion"));

    /* the order is important */
#ifdef __linux
    /* CEF calls gtk_disable_setlocale() during its own startup, so that GTK does not
       call setlocale() and move the process off the locale Chromium has settled on.
       gtk_init() here runs first and makes that call a no-op, and GTK prints
       "gtk_disable_setlocale() must be called before gtk_init()" for it - a line that
       turns up in the logs attached to #1324 and #1832 and sends triage after the
       wrong thing. Say it before gtk_init() so the intent is honoured and the warning
       stops.

       Safe where it stands: SingleApplication is constructed above, and Qt calls
       setlocale(LC_ALL, "") itself during that, so the process locale is already
       established and GTK dialogs stay translated. Measured rather than assumed - under
       LC_ALL=de_DE.UTF-8 a QCoreApplication moves LC_NUMERIC from C to de_DE.UTF-8. */
    gtk_disable_setlocale();
    gtk_init(&argc, &argv);
#endif
    CApplicationCEF::Prepare(argc, argv);
    CApplicationCEF* application_cef = new CApplicationCEF();
    setup_paths(&AscAppManager::getInstance());
    application_cef->Init_CEF(&AscAppManager::getInstance(), argc, argv);
    /* ********************** */

//    GET_REGISTRY_SYSTEM(reg_system)
    GET_REGISTRY_USER(reg_user)
    reg_user.setFallbacksEnabled(false);

    /* read lang fom different places
     * cmd argument --lang:en apply the language one time
     * cmd argument --keeplang:en also keep the language for next sessions
    */
    CLangater::init();
    AscAppManager::initializeApp();
    AscAppManager::startApp();
    AscAppManager::getInstance().StartSpellChecker();
    AscAppManager::getInstance().StartKeyboardChecker();
    AscAppManager::getInstance().CheckFonts();

    bool bIsOwnMessageLoop = false;
    int exit_code = application_cef->RunMessageLoop(bIsOwnMessageLoop);
    if (!bIsOwnMessageLoop)
        exit_code = app.exec();

    AscAppManager::getInstance().CloseApplication();
    delete application_cef;
    return exit_code;
}
