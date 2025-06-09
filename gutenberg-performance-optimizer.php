<?php
/**
 * Plugin Name: Gutenberg Performance Optimizer
 * Plugin URI: https://github.com/yourusername/gutenberg-performance-optimizer
 * Description: Enhances Gutenberg editor performance by implementing block caching, lazy loading, and other optimizations.
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://yourwebsite.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: gutenberg-performance-optimizer
 * Domain Path: /languages
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

// Define plugin constants
define('GPO_VERSION', '1.0.0');
define('GPO_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('GPO_PLUGIN_URL', plugin_dir_url(__FILE__));

class GutenbergPerformanceOptimizer {
    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('init', array($this, 'init'));
        add_action('enqueue_block_editor_assets', array($this, 'enqueue_editor_assets'));
        add_action('admin_init', array($this, 'register_settings'));
    }

    public function init() {
        // Initialize plugin functionality
        $this->setup_block_caching();
        $this->setup_lazy_loading();
    }

    public function enqueue_editor_assets() {
        wp_enqueue_script(
            'gpo-editor',
            GPO_PLUGIN_URL . 'build/index.js',
            array('wp-blocks', 'wp-dom', 'wp-edit-post', 'wp-element', 'wp-i18n'),
            GPO_VERSION,
            true
        );

        wp_enqueue_style(
            'gpo-editor-style',
            GPO_PLUGIN_URL . 'build/index.css',
            array(),
            GPO_VERSION
        );

        // Pass settings to JavaScript
        wp_localize_script('gpo-editor', 'gpoSettings', array(
            'cacheEnabled' => get_option('gpo_enable_cache', true),
            'lazyLoadEnabled' => get_option('gpo_enable_lazy_load', true),
            'batchSize' => get_option('gpo_batch_size', 10),
        ));
    }

    public function register_settings() {
        register_setting('gpo_options', 'gpo_enable_cache');
        register_setting('gpo_options', 'gpo_enable_lazy_load');
        register_setting('gpo_options', 'gpo_batch_size');
    }

    private function setup_block_caching() {
        if (get_option('gpo_enable_cache', true)) {
            add_filter('render_block', array($this, 'cache_block_output'), 10, 2);
        }
    }

    private function setup_lazy_loading() {
        if (get_option('gpo_enable_lazy_load', true)) {
            add_filter('render_block', array($this, 'lazy_load_block'), 10, 2);
        }
    }

    public function cache_block_output($block_content, $block) {
        // Generate cache key based on block attributes and content
        $cache_key = 'gpo_block_' . md5(serialize($block));
        
        // Try to get cached content
        $cached_content = wp_cache_get($cache_key);
        
        if (false !== $cached_content) {
            return $cached_content;
        }
        
        // Cache the block content
        wp_cache_set($cache_key, $block_content, '', 3600); // Cache for 1 hour
        
        return $block_content;
    }

    public function lazy_load_block($block_content, $block) {
        // Add lazy loading attributes to images and iframes
        if (strpos($block_content, '<img') !== false) {
            $block_content = preg_replace('/<img(.*?)>/', '<img$1 loading="lazy">', $block_content);
        }
        
        if (strpos($block_content, '<iframe') !== false) {
            $block_content = preg_replace('/<iframe(.*?)>/', '<iframe$1 loading="lazy">', $block_content);
        }
        
        return $block_content;
    }
}

// Initialize the plugin
function gutenberg_performance_optimizer_init() {
    GutenbergPerformanceOptimizer::get_instance();
}
add_action('plugins_loaded', 'gutenberg_performance_optimizer_init'); 