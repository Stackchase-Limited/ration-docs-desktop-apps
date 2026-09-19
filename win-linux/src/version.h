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
# define VER_STR_LONG(mj,mn,b,r)    VER_STRINGIFY(mj) "." VER_STRINGIFY(mn) "." VER_STRINGIFY(b) "." VER_STRINGIFY(r) "\0"
# define VER_STR_SHORT(mj,mn)       VER_STRINGIFY(mj) "." VER_STRINGIFY(mn) "\0"

# define VER_NUM_MAJOR              5
# define VER_NUM_MINOR              3
# define VER_NUM_BUILD              95
# define VER_NUM_REVISION           508
# define VER_NUMBER                 VER_NUM_MAJOR,VER_NUM_MINOR,VER_NUM_BUILD,VER_NUM_REVISION
# define VER_STRING                 VER_STR_LONG(VER_NUM_MAJOR,VER_NUM_MINOR,VER_NUM_BUILD,VER_NUM_REVISION)
# define VER_STRING_SHORT           VER_STR_SHORT(VER_NUM_MAJOR,VER_NUM_MINOR)

# define VER_FILEVERSION            VER_NUMBER
# define VER_FILEVERSION_STR        VER_STRING

# define VER_PRODUCTVERSION         VER_FILEVERSION
# define VER_PRODUCTVERSION_STR     VER_STRING_SHORT
#endif

/* Attribution. LICENSE carries additional terms under AGPL s.7 that this block has
   to satisfy, so it is written against them rather than by eye:

     1. Retention of Notices and Attribution - all copyright, licence, warranty and
        origin notices in the Program must be retained. Hence Ascensio System SIA's
        notice stays, with its own years, beside ours rather than being replaced by
        it.
     2. Modification Notice Requirement - a modified version must carry prominent
        notices stating that it is modified, INCLUDING THE DATE, and must clearly
        indicate that it is based on the original ONLYOFFICE software developed by
        Ascensio System SIA. That is what VER_COMMENTS_STR is for: the version
        resource is where Windows shows a binary's provenance, and it is the only
        place in an .exe a user can look without running it.
     4. No Trademark License - so the mark appears only where it identifies whose
        software this started as, which term 2 requires, and the resource says so
        outright instead of leaving the reader to infer a relationship.

   "All rights reserved" as a trademark line, which is what this said before, is
   both meaningless here and wrong: the rights in the code are not reserved, they
   are granted under the AGPL. */
#define VER_COMPANYNAME_STR         "Stackchase Limited\0"
#define VER_LEGALCOPYRIGHT_STR      "© Stackchase Limited " TO_STR(COPYRIGHT_YEAR) ". © Ascensio System SIA 2009-" TO_STR(COPYRIGHT_YEAR) ".\0"
#define VER_COMPANYDOMAIN_STR       "ration.works\0"
#define ABOUT_COPYRIGHT_STR         VER_LEGALCOPYRIGHT_STR
#define VER_COMMENTS_STR            "Ration Docs is a modified version of ONLYOFFICE Desktop Editors, " \
                                    "originally developed by Ascensio System SIA. Modified by " \
                                    "Stackchase Limited, " TO_STR(COPYRIGHT_YEAR) ". Licensed under the GNU AGPL v3 " \
                                    "with additional terms; see the LICENSE file supplied with this program.\0"
#define VER_FILEDESCRIPTION_STR     "Ration Docs\0"
#define VER_INTERNALNAME_STR        "Ration Docs\0"
#define VER_LEGALTRADEMARKS1_STR    "ONLYOFFICE is a trademark of Ascensio System SIA, used here only to " \
                                    "identify the software this product is based on. Ration Docs is not " \
                                    "produced by, endorsed by, or affiliated with Ascensio System SIA.\0"
#define VER_LEGALTRADEMARKS2_STR    VER_LEGALTRADEMARKS1_STR
#define VER_ORIGINALFILENAME_STR    "RationDocs.exe\0"
#define VER_PRODUCTNAME_STR         "Ration Docs\0"

#define VER_LANG_AND_CHARSET        "040904E4"
#define VER_LANG_ID                 0x0409
#define VER_CHARSET_ID              1252

#ifndef RC_COMPILE_FLAG
# include "version_p.h"
#endif

#endif

