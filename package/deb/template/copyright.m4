Format: https://www.debian.org/doc/packaging-manuals/copyright-format/1.0/
Upstream-Name: M4_COMPANY_NAME M4_PRODUCT_NAME
Upstream-Contact: M4_PUBLISHER_NAME <M4_SUPPORT_MAIL>
Source: M4_SOURCE_URL
Comment: M4_COMPANY_NAME M4_PRODUCT_NAME is a modified version of ONLYOFFICE Desktop
 Editors, originally developed by Ascensio System SIA. It is not produced by, and
 carries no endorsement from, Ascensio System SIA, and ONLYOFFICE is their
 trademark. The AGPL additional terms that come with the original require the
 original developer to remain identifiable and the modification to be declared;
 both are also shown in the application's About box.

dnl Two copyright holders, in the order that says which is which. Nearly all of
dnl this package is ONLYOFFICE Desktop Editors, written by Ascensio System SIA; our
dnl changes sit on top of it. Naming only the publisher - which is what this file
dnl used to do, with the publisher name substituted - would have claimed their work
dnl as ours, and AGPL s.1 requires their notice to survive in any case.
Files: *
Copyright: 2009-M4_CURRENT_YEAR, Ascensio System SIA <info@onlyoffice.com>
           ifelse(M4_CURRENT_YEAR, 2026, 2026, 2026-M4_CURRENT_YEAR), M4_PUBLISHER_NAME <M4_SUPPORT_MAIL>
ifelse(M4_PACKAGE_EDITION, commercial,
`License: Proprietary',
`License: AGPL-3.0-only')

dnl Additional term 5 puts the non-code elements under CC BY-SA 4.0, which has an
dnl attribution requirement of its own: name the creator, keep the notices, say
dnl where the material came from, and state that it was modified. The Comment does
dnl that; without it a bare "License: CC-BY-SA-4.0" names a licence whose terms are
dnl not actually being met.
ifelse(M4_PACKAGE_EDITION, commercial,,
`Files: *.gif *.ico *.jpg *.png *.svg
Copyright: 2009-M4_CURRENT_YEAR, Ascensio System SIA <info@onlyoffice.com>
           ifelse(M4_CURRENT_YEAR, 2026, 2026, 2026-M4_CURRENT_YEAR), M4_PUBLISHER_NAME <M4_SUPPORT_MAIL>
Comment: Illustrations and icon sets originate in ONLYOFFICE Desktop Editors by
 Ascensio System SIA, obtained from https://github.com/ONLYOFFICE/DesktopEditors.
 Some have been replaced or altered for M4_COMPANY_NAME M4_PRODUCT_NAME. The
 application icon and wordmark are the original work of M4_PUBLISHER_NAME and are
 not covered by this entry.
License: CC-BY-SA-4.0')

dnl copyright-format 1.0 requires a standalone License paragraph for every short
dnl name used above; there were none, so the file named two licences and supplied
dnl neither. These also carry the pointer to the full text that AGPL s.4 and CC
dnl BY-SA s.3(a) both require.
License: AGPL-3.0-only
 This program is free software: you can redistribute it and/or modify it under
 the terms of the GNU Affero General Public License version 3 as published by the
 Free Software Foundation, together with the additional terms supplied with the
 Program.
 .
 This program is distributed in the hope that it will be useful, but WITHOUT ANY
 WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
 .
 The complete licence text, including the additional terms, is installed with this
 package at /opt/M4_DESKTOPEDITORS_PREFIX/LICENSE.txt and at
 /usr/share/licenses/M4_PACKAGE_NAME/LICENSE, and is available online at
 <https://www.gnu.org/licenses/agpl-3.0.html>.

License: CC-BY-SA-4.0
 The non-code elements listed above are licensed under the Creative Commons
 Attribution-ShareAlike 4.0 International License.  You may share and adapt them
 provided you give appropriate credit, indicate whether changes were made, and
 license any adaptation under the same terms.
 .
 The complete licence text is available at
 <https://creativecommons.org/licenses/by-sa/4.0/legalcode>.
