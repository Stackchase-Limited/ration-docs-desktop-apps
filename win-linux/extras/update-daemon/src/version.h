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

#ifndef VERSION_H
#define VERSION_H

#define VER_STRINGIFY(d)            #d
#define TO_STR(v)                   VER_STRINGIFY(v)

#ifdef VER_PRODUCT_VERSION
# define VER_FILEVERSION            VER_PRODUCT_VERSION_COMMAS
# define VER_FILEVERSION_STR        TO_STR(VER_PRODUCT_VERSION)

# define VER_PRODUCTVERSION         VER_FILEVERSION
# define VER_PRODUCTVERSION_STR     TO_STR(VER_PRODUCT_VERSION)
#else
# define VER_STR_LONG(mj,mn,b,r)     VER_STRINGIFY(mj) "." VER_STRINGIFY(mn) "." VER_STRINGIFY(b) "." VER_STRINGIFY(r) "\0"
# define VER_STR_SHORT(mj,mn)        VER_STRINGIFY(mj) "." VER_STRINGIFY(mn) "\0"

# define VER_NUM_MAJOR               5
# define VER_NUM_MINOR               2
# define VER_NUM_BUILD               46
# define VER_NUM_REVISION            24
# define VER_NUMBER                  VER_NUM_MAJOR,VER_NUM_MINOR,VER_NUM_BUILD,VER_NUM_REVISION
# define VER_STRING                  VER_STR_LONG(VER_NUM_MAJOR,VER_NUM_MINOR,VER_NUM_BUILD,VER_NUM_REVISION)
# define VER_STRING_SHORT            VER_STR_SHORT(VER_NUM_MAJOR,VER_NUM_MINOR)

# define VER_FILEVERSION             VER_NUMBER
# define VER_FILEVERSION_STR         VER_STRING

# define VER_PRODUCTVERSION          VER_FILEVERSION
# define VER_PRODUCTVERSION_STR      VER_STRING_SHORT
#endif

#define VER_LANG_AND_CHARSET_STR    "040904E4"
#define VER_LANG_ID                 0x0409
#define VER_CHARSET_ID              1252

/* Attribution per the additional terms in LICENSE - see src/version.h for the full
   reasoning. In short: term 1 keeps Ascensio System SIA's notice, term 2 requires
   the modification notice with its date (VER_COMMENTS_STR), term 4 grants no rights
   in their marks. */
#define VER_FILEDESCRIPTION_STR     "Ration Docs Update Service\0"
#define VER_PRODUCTNAME_STR         "Ration Docs Update Service\0"
#define VER_COMPANYNAME_STR         "Stackchase Limited\0"
#define VER_LEGALCOPYRIGHT_STR      "© Stackchase Limited " TO_STR(COPYRIGHT_YEAR) ". © Ascensio System SIA 2009-" TO_STR(COPYRIGHT_YEAR) ".\0"
#define VER_COMPANYDOMAIN_STR       "ration.works\0"
#define ABOUT_COPYRIGHT_STR         VER_LEGALCOPYRIGHT_STR
#define VER_COMMENTS_STR            "Part of Ration Docs, a modified version of ONLYOFFICE Desktop Editors, " \
                                    "originally developed by Ascensio System SIA. Modified by " \
                                    "Stackchase Limited, " TO_STR(COPYRIGHT_YEAR) ". Licensed under the GNU AGPL v3 " \
                                    "with additional terms; see the LICENSE file supplied with this program.\0"
#define VER_INTERNALNAME_STR        "Ration Docs Update Service\0"
#define VER_LEGALTRADEMARKS1_STR    "ONLYOFFICE is a trademark of Ascensio System SIA, used here only to " \
                                    "identify the software this product is based on. Ration Docs is not " \
                                    "produced by, endorsed by, or affiliated with Ascensio System SIA.\0"
#define VER_LEGALTRADEMARKS2_STR    VER_LEGALTRADEMARKS1_STR
#define VER_ORIGINALFILENAME_STR    "updatesvc.exe\0"

#define VER_LANG_AND_CHARSET_STR    "040904E4"
#define VER_LANG_ID                 0x0409
#define VER_CHARSET_ID              1252

#define VER_FILEDESCRIPTION_STR     "ONLYOFFICE Update Service\0"
#define VER_PRODUCTNAME_STR         "ONLYOFFICE Update Service\0"
#define VER_COMPANYNAME_STR         "Ascensio System SIA\0"
#define VER_LEGALCOPYRIGHT_STR      "© Ascensio System SIA " TO_STR(COPYRIGHT_YEAR) ". All rights reserved.\0"
#define VER_COMPANYDOMAIN_STR       "www.onlyoffice.com\0"

#define VER_INTERNALNAME_STR        "AppIcons\0"
#define VER_LEGALTRADEMARKS1_STR    "All rights reserved\0"
#define VER_LEGALTRADEMARKS2_STR    VER_LEGALTRADEMARKS1_STR
#define VER_ORIGINALFILENAME_STR    "updatesvc.exe\0"

#ifdef APP_USE_PRIVATE_ASSETS
# include "src/version_p.h"
#endif

#endif

