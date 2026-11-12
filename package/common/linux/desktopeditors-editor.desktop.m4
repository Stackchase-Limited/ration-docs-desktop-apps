include(defines.m4)dnl
dnl #591: one launcher per editor (document, spreadsheet, presentation, PDF form),
dnl built only with EDITOR_LAUNCHERS=1. It is the same application started with
dnl --new:<editor>, as the Windows Start menu shortcuts and the Desktop Actions of
dnl the main .desktop file already do. It claims no MimeType, so which program opens
dnl which file type stays with the main entry; and it sets no StartupWMClass, so its
dnl windows group under the main entry, which is the one application that runs.
define(`_ED_UP', ifelse(M4_EDITOR, word, WORD, M4_EDITOR, cell, CELL, M4_EDITOR, slide, SLIDE, FORM))dnl
define(`_L', `indir(`_NEW_'_ED_UP`'ifelse($1,,,_$1))')dnl
[Desktop Entry]
Version=1.0
Name=_NAME ifelse(M4_EDITOR, word, Document, M4_EDITOR, cell, Spreadsheet, M4_EDITOR, slide, Presentation, PDF Form)
GenericName=ifelse(M4_EDITOR, word, Word Processor, M4_EDITOR, cell, Spreadsheet, M4_EDITOR, slide, Presentation, PDF Form Editor)
Comment=_L()
Comment[ar]=_L(ar)
Comment[be]=_L(be)
Comment[bg]=_L(bg)
Comment[ca]=_L(ca)
Comment[cs]=_L(cs)
Comment[da]=_L(da)
Comment[de]=_L(de)
Comment[el]=_L(el)
Comment[es]=_L(es)
Comment[fi]=_L(fi)
Comment[fr]=_L(fr)
Comment[gl]=_L(gl)
Comment[he]=_L(he)
Comment[hu]=_L(hu)
Comment[hy]=_L(hy)
Comment[id]=_L(id)
Comment[it]=_L(it)
Comment[ja]=_L(ja)
Comment[ko]=_L(ko)
Comment[lo]=_L(lo)
Comment[lv]=_L(lv)
Comment[nb]=_L(nb)
Comment[nl]=_L(nl)
Comment[pl]=_L(pl)
Comment[pt]=_L(pt)
Comment[pt_BR]=_L(ptbr)
Comment[ro]=_L(ro)
Comment[ru]=_L(ru)
Comment[si]=_L(si)
Comment[sk]=_L(sk)
Comment[sl]=_L(sl)
Comment[sq]=_L(sq)
Comment[sr@latin]=_L(srlat)
Comment[sr]=_L(sr)
Comment[sv]=_L(sv)
Comment[tr]=_L(tr)
Comment[uk]=_L(uk)
Comment[ur]=_L(ur)
Comment[vi]=_L(vi)
Comment[zh_CN]=_L(zhcn)
Comment[zh_TW]=_L(zhtw)
Type=Application
Exec=/usr/bin/M4_DESKTOPEDITORS_EXEC --new:M4_EDITOR
Terminal=false
Icon=M4_DESKTOPEDITORS_EXEC-M4_EDITOR
Categories=ifelse(M4_EDITOR, word, Office;WordProcessor;, M4_EDITOR, cell, Office;Spreadsheet;, M4_EDITOR, slide, Office;Presentation;, Office;)
Keywords=ifelse(M4_EDITOR, word, Text;Document;Word;docx;odt;, M4_EDITOR, cell, Spreadsheet;Excel;xlsx;ods;, M4_EDITOR, slide, Presentation;Slides;PowerPoint;pptx;odp;, PDF;Form;)
