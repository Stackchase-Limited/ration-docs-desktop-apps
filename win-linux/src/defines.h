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

#ifndef DEFINES_H
#define DEFINES_H

#define rePortalName        "^https?:\\/\\/(.+)"
#define reFileExtension     "\\.(\\w{1,10})$"
#define reUserName          "([^\\.]+)\\.?([^\\.]+)?"
#define reCmdLang           "--(keep)?lang[:|=](\\w{2,5})"

/* Product identity. macOS was renamed in e829d0d7d (PRODUCT_NAME "Ration Docs",
   bundle id com.stackchase.rationdocs); this is the same change for the Linux and
   Windows application, which had never been built and so had never been looked at.

   Every one of these is a name the operating system sees, not just a label:

     APP_DATA_PATH / REG_GROUP_KEY / REG_APP_NAME  where settings and recent files
       live: ~/.config/ration/RationDocs.conf and ~/.local/share/ration/docs on
       Linux. The vendor/product split matches the package (ration-docs, installed
       to /opt/ration/docs) and the deb's postrm, which removes that settings file
       by name - the three have to agree or uninstalling leaves it behind. Changing
       them once, before anyone has installed this, is free; changing them later
       strands whatever a user has already set.
     APP_MUTEX_NAME  single-instance detection. Sharing ONLYOFFICE's name meant a
       machine with ONLYOFFICE installed would treat the two as one application and
       hand our file to their window.
     APP_PROTOCOL / DESKTOP_FILE_NAME / FILE_PREFIX  the URL scheme, the launcher
       entry and the temporary-file prefix, all of which collide the same way.
     APP_USER_MODEL_ID  Windows taskbar grouping and jump lists. */
#define APP_NAME "RationDocs"
#define APP_TITLE "Ration Docs"
#ifdef __linux
# define APP_DATA_PATH "/ration/docs"
# define REG_GROUP_KEY "ration"
# define APP_MUTEX_NAME "rationdocs:editors"
# define DESKTOP_FILE_NAME "ration-docs"
#else
# define APP_DATA_PATH "/Ration/Docs"
# define APP_REG_NAME  "RationDocs"
# define REG_GROUP_KEY "Ration"
# define REG_UNINST_KEY "Ration Docs"
# define APP_MUTEX_NAME "RationDocs"
#endif

#define WINDOW_NAME "Ration Docs"
#define WINDOW_TITLE WINDOW_NAME
#define WINDOW_CLASS_NAME L"DocEditorsWindowClass"
#define WINDOW_EDITOR_CLASS_NAME L"SingleWindowClass"
#define REG_APP_NAME "RationDocs"
#define APP_DEFAULT_LOCALE "en-US"
#define APP_DEFAULT_SYSTEM_LOCALE 1
#define APP_USER_MODEL_ID "Stackchase.RationDocs.1"
#define APP_SIMPLE_WINDOW_TITLE "Ration Docs Editor"
#define APP_PROTOCOL "rationdocs"
#define FILE_PREFIX "rationdocs_"

#define URL_SITE                "https://lab02.ration.works/ration/ration-docs-desktop"
/* Left pointing at ONLYOFFICE deliberately. This is the "create a portal" link in
   the connect-a-cloud dialog, and an ONLYOFFICE portal is what it creates - it is a
   reference to their service, not a claim about ours. We do not run a cloud. */
#define URL_SIGNUP              "https://onlyoffice.com/registration.aspx?desktop=true"

#define GET_REGISTRY_USER(variable) \
    QSettings variable(QSettings::NativeFormat, QSettings::UserScope, REG_GROUP_KEY, REG_APP_NAME);
#define GET_REGISTRY_SYSTEM(variable) \
    QSettings variable(QSettings::SystemScope, REG_GROUP_KEY, REG_APP_NAME);

#define LOCAL_PATH_OPEN         1
#define LOCAL_PATH_SAVE         2

#define ACTIONPANEL_CONNECT     255
#define ACTIONPANEL_ACTIVATE    ACTIONPANEL_CONNECT + 1

#define URL_AGPL "https://www.gnu.org/licenses/agpl-3.0.en.html"
#define DOWNLOAD_PAGE "https://lab02.ration.works/ration/ration-docs-desktop/-/releases"
#define RELEASE_NOTES "https://lab02.ration.works/ration/ration-docs-desktop/-/blob/ration/9.4-stability/CHANGELOG.md"

#ifdef __linux
typedef unsigned char BYTE;
#else
# define UM_INSTALL_UPDATE      WM_USER+254
#endif

#define UM_ENDMOVE (QEvent::User + 2)

#define TO_WSTR(str)            L ## str
#define WSTR(str)               TO_WSTR(str)

#ifdef __linux
# define VK_F1 0x70
# define VK_F4 0x73
# define VK_TAB 0x09
#endif

#define APP_PORT   12010
#define SVC_PORT   12011
#define INSTANCE_SVC_PORT 12012
#define INSTANCE_APP_PORT 13012

#define WARNING_LAUNCH_WITH_ADMIN_RIGHTS "App can't working correctly under admin rights."

#include "defines_p.h"

#endif // DEFINES_H

