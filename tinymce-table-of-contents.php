<?php

// This file is part of TinyMCE Table of Contents - https://github.com/julenpardo/tinymce-table-of-contents
//
// TinyMCE Table of Contents is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// TinyMCE Table of Contents is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with TinyMCE Table of Contents.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Plugin Name: TinyMCE Table of Contents
 * Version: 1.0
 * Plugin URI: https://github.com/julenpardo/tinymce-table-of-contents
 * Author: Julen Pardo
 * Author URI: https://github.com/julenpardo
 * Description: Completely automated and instantaneous way of generating tables of contents for posts.
 * Tested up to: 4.5
 * License: GPLv3
 */

class TinyMCE_Table_of_Contents {

    const VERSION = '1.0';

    /**
     * TinyMCE_Table_of_Contents class constructor.
     */
    public function __construct() {
        if ( is_admin() ) {
            add_action( 'init', array( $this, 'setup_tinymce_plugin' ) );
        }
    }

    /**
     * Initializes the plugin.
     */
    public function setup_tinymce_plugin() {
            
        if ( ! current_user_can( 'edit_posts' ) && ! current_user_can( 'edit_pages' ) ) {
            return;
        }

        if ( get_user_option( 'rich_editing' ) !== 'true' ) {
            return;
        }

        add_filter( 'mce_external_plugins', array( $this, 'add_tinymce_plugin' ) );
        add_filter( 'mce_buttons', array( $this, 'add_tinymce_toolbar_button' ) );
    }

    public function add_tinymce_plugin( $plugin_array ) {
        $plugin_array['table_of_contents'] = plugin_dir_url( __FILE__ ) . '/js/table-of-contents.min.js';

        return $plugin_array;
    }

    public function add_tinymce_toolbar_button( $buttons ) {
        array_push( $buttons, 'table_of_contents' );

        return $buttons;
    }
}

$tinymce_table_of_contents = new TinyMCE_Table_of_Contents();

?>
