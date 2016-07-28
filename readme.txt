=== TinyMCE Table of Contents ===
Contributors: julenpardo
Tags: tinymce, table of contents, index
Requires at least: 4.0
Tested up to: 4.5.3
Stable tag: 1.0
License: GPLv3

Completely automated and instantaneous way of generating tables of contents for posts.

== Description ==

How much time have you spent every time you have created a table of contents manually? Or you may even haven't do it because of the pain that it would suppose to do it manually?

With this plugin, you will be able to generate tables of contents for your posts in a completely easy, automated and personalizable way. It automatically looks for every <h*> tag, to generate the table entries for them.

Features:

* Configuration of the depth level of the table.
* Configuration of the indentation of the levels of the table.
* Option to add to the elements of the table link to each section.

== Installation ==

If you have ever installed a WordPress plugin, then installation will be pretty easy:

1. Download the TinyMCE Table of Contents plugin and extract the files.
2. You should have now a directory named 'tinymce-table-of-contents' with some files in its root. Copy this directory into '/path/to/wordpress/wp-contents/plugins'.
3. Enable the plugin from WordPress (Plugins > Installed Plugins >Activate option, for TinyMCE Table of Contents).
4. A new element should now appear in TinyMCE editor. Just click it and select the options you want for your table of contents.

== Frequently Asked Questions ==

= How are links added? If my titles already have an id attribute, will they be overwritten? =

The links are added by adding an id attribute to each title appearing in the table of contents, but only if it doesn't have it; original id attributes are not overwritten, not to break any other possible reference.

The format of the generated id is "section_x", "section_x_y", etc. Then, the link is just a hyperlink to the "id" (e.g., "< a href='#section_x'>Section X</a>").

= How is the indentation added? =

The indentation of each level of the table is just a set of `&nbsp;`, styled with `white-space: pre;`, to make the browser preserve them.

= How do I notify about a bug/feature request? =

Open an issue in the <a href="https://github.com/julenpardo/tinymce-table-of-contents/issues" target="_blank">bug tracker</a>, giving as much as information possible:

* For bugs: steps to reproduce; WordPress version.
* For features: a detailed description of what is wanted to achieve.

== Screenshots ==

1. TinyMCE Table of Contents in the editor
2. Options for creating table of contents
3. Generated table of contents

== Changelog ==

= 1.0 =
First release.
