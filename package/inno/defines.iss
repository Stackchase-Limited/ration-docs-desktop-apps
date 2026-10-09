; -- Ration Docs Defines --
;
; Every name below is one Windows or the application itself looks up, so each has to
; agree with win-linux/src/defines.h (Windows branch), not just read well:
;
;   APP_REG_PATH            Software\Ration\RationDocs = REG_GROUP_KEY\REG_APP_NAME.
;                           The app reads Capabilities\FileAssociations under it to
;                           decide which formats to offer to associate; under the old
;                           Software\ONLYOFFICE\DesktopEditors it found nothing.
;   APP_REG_UNINST_KEY      REG_UNINST_KEY "Ration Docs".
;   APP_USER_MODEL_ID       APP_USER_MODEL_ID, also in extras/projicons/ProjIcons.pro.
;   APP_MUTEX_NAME          APP_MUTEX_NAME, used to detect a running copy.
;   sAppProtocol            APP_PROTOCOL and desktop-sdk GetExternalSchemeName().
;   ASCC_REG_REGISTERED_APP_NAME  APP_REG_NAME: Association passes it to
;                           IApplicationAssociationRegistration::SetAppAsDefault, which
;                           looks it up under Software\RegisteredApplications.
;
; The ProgIDs (ASCC_REG_PREFIX, ASSOC_PROG_ID) and the scheme were ONLYOFFICE's, so a
; machine with both installed had whichever installed last own .docx, .xlsx and links.
;
; iconsExe and NAME_EXE_OUT keep the deploy layout (build_tools deploy_desktop.py):
; DesktopEditors.exe is the projicons stub that carries the file-type icons and
; launches editors.exe.

#define sCompanyName                    "Ration"
#define sIntCompanyName                 sCompanyName
#define sProductName                    "Docs"
#define sIntProductName                 "RationDocs"
#define sAppName                        "Ration Docs"
#define sPackageName                    "RationDocs"
#define sAppPublisher                   "Stackchase Limited"
#define sAppPublisherURL                "https://lab02.ration.works/ration/ration-docs-desktop"
#define sAppSupportURL                  "https://lab02.ration.works/ration/ration-docs-desktop/-/issues"
#define sAppCopyright                   str("© " + sAppPublisher + " " + GetDateTimeString("yyyy",,) + ". © Ascensio System SIA 2009-" + GetDateTimeString("yyyy",,) + ".")
#define sAppIconName                    "Ration Docs"
; Shortcuts deleted before ours are created. This was "ONLYOFFICE Editors", which would
; have deleted ONLYOFFICE's own shortcuts on a machine that has both.
#define sOldAppIconName                 sAppIconName
#define sAppProtocol                    'rationdocs'

#define APP_PATH                        str(sIntCompanyName + "\" + sIntProductName)
#define UPD_PATH                        str(sIntProductName + "Updates")
#define APP_REG_PATH                    str("Software\" + APP_PATH)
#define APP_REG_UNINST_KEY              str(sCompanyName + " " + sProductName)
#define APP_USER_MODEL_ID               "Stackchase.RationDocs.1"
#define APP_MUTEX_NAME                  "RationDocs"
#define APPWND_CLASS_NAME               "DocEditorsWindowClass"

#define iconsExe                        "DesktopEditors.exe"
#define NAME_EXE_OUT                    "editors.exe"

#define ASSC_APP_NAME                   "Ration Docs"
#define ASCC_REG_PREFIX                 "RationDocs"
#define ASCC_REG_REGISTERED_APP_NAME    "RationDocs"
#define ASSOC_PROG_ID                   "RationDocs.Editors"
#define ASSOC_APP_FRIENDLY_NAME         "Ration Docs"
