#ifndef GLIB_INCLUDES_H
#define GLIB_INCLUDES_H

/* GLib's headers and Qt's keyword macros cannot be parsed in that order.
 *
 * Qt defines
 *     #define signals Q_SIGNALS          // -> "public QT_ANNOTATE_ACCESS_SPECIFIER(...)"
 * and gio/gdbusintrospection.h declares
 *     GDBusSignalInfo **signals;
 * so any translation unit that reaches a Qt header first - which on Linux means any
 * file whose gtk/gio includes sit inside "#ifdef Q_OS_LINUX", since knowing that
 * symbol requires Qt - fails inside a system header with nothing to point at the
 * cause:
 *     /usr/include/.../qt5/QtCore/qobjectdefs.h:93:20: error: expected unqualified-id
 *     before 'public'
 *     note: in expansion of macro 'signals'
 *     /usr/include/glib-2.0/gio/gdbusintrospection.h:157:25: GDBusSignalInfo **signals;
 *
 * Suppressing the keyword around the glib includes is Qt's own documented answer to
 * this. push_macro/pop_macro is used rather than a bare #undef so that Qt's macro is
 * restored exactly as it was, and so this header is harmless when included before any
 * Qt header at all.
 */

#pragma push_macro("signals")
#undef signals

#include <gtk/gtk.h>
#include <gio/gio.h>
#include <glib.h>

#pragma pop_macro("signals")

#endif // GLIB_INCLUDES_H
