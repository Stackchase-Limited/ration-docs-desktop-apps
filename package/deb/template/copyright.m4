Format: https://www.debian.org/doc/packaging-manuals/copyright-format/1.0/
Upstream-Name: M4_COMPANY_NAME M4_PRODUCT_NAME
Upstream-Contact: M4_PUBLISHER_NAME <M4_SUPPORT_MAIL>
Source: M4_PUBLISHER_URL
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
           2026-M4_CURRENT_YEAR, M4_PUBLISHER_NAME <M4_SUPPORT_MAIL>
ifelse(M4_PACKAGE_EDITION, commercial,
`License: Proprietary',
`License: AGPL-3.0-only')

ifelse(M4_PACKAGE_EDITION, commercial,,
`Files: *.gif *.ico *.jpg *.png *.svg
Copyright: 2009-M4_CURRENT_YEAR, Ascensio System SIA <info@onlyoffice.com>
           2026-M4_CURRENT_YEAR, M4_PUBLISHER_NAME <M4_SUPPORT_MAIL>
License: CC-BY-SA-4.0')
