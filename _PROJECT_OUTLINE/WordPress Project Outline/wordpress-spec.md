# AI Expert Panel - WordPress Plugin Specification

## Plugin Structure
```
ai-expert-panel/
├── admin/
│   ├── class-admin.php
│   ├── js/
│   │   └── admin.js
│   └── views/
│       ├── dashboard.php
│       └── settings.php
├── includes/
│   ├── class-api-handler.php
│   ├── class-discussion.php
│   ├── class-expert.php
│   ├── class-moderator.php
│   └── class-ai-client.php
├── public/
│   ├── class-public.php
│   ├── js/
│   │   └── discussion.js
│   └── css/
│       └── discussion.css
├── ai-expert-panel.php
└── uninstall.php
```

## Database Schema
```sql
CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}aep_experts` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `role` varchar(50) NOT NULL,
  `expertise` text NOT NULL,
  `prompt_template` text NOT NULL,
  `system_context` text NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}aep_discussions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `topic` varchar(255) NOT NULL,
  `status` varchar(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}aep_messages` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `discussion_id` bigint(20) NOT NULL,
  `expert_id` bigint(20) NOT NULL,
  `content` text NOT NULL,
  `reply_to` bigint(20) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `discussion_id` (`discussion_id`),
  KEY `expert_id` (`expert_id`)
);

CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}aep_settings` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `option_name` varchar(100) NOT NULL,
  `option_value` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `option_name` (`option_name`)
);
```

## Core Classes

### AI Client Handler
```php
class AEP_AI_Client {
    private $api_key;
    private $model;
    
    public function __construct() {
        $this->api_key = get_option('aep_claude_api_key');
        $this->model = 'claude-3-sonnet-20240229';
    }
    
    public function generate_response($expert, $discussion, $prompt) {
        $messages = [
            [
                'role' => 'system',
                'content' => $this->build_system_prompt($expert, $discussion)
            ],
            [
                'role' => 'user',
                'content' => $prompt
            ]
        ];
        
        return $this->call_claude_api($messages);
    }
}
```

### Discussion Handler
```php
class AEP_Discussion {
    public function create_discussion($topic, $user_id) {
        global $wpdb;
        
        $data = [
            'topic' => sanitize_text_field($topic),
            'status' => 'active',
            'user_id' => absint($user_id),
            'created_at' => current_time('mysql'),
            'updated_at' => current_time('mysql')
        ];
        
        $wpdb->insert("{$wpdb->prefix}aep_discussions", $data);
        return $wpdb->insert_id;
    }
    
    public function add_message($discussion_id, $expert_id, $content, $reply_to = null) {
        global $wpdb;
        
        $data = [
            'discussion_id' => absint($discussion_id),
            'expert_id' => absint($expert_id),
            'content' => wp_kses_post($content),
            'reply_to' => $reply_to ? absint($reply_to) : null,
            'created_at' => current_time('mysql')
        ];
        
        $wpdb->insert("{$wpdb->prefix}aep_messages", $data);
        return $wpdb->insert_id;
    }
}
```

## REST API Endpoints
```php
class AEP_API_Handler {
    public function register_routes() {
        register_rest_route('aep/v1', '/discussions', [
            'methods' => 'POST',
            'callback' => [$this, 'create_discussion'],
            'permission_callback' => [$this, 'check_permission']
        ]);
        
        register_rest_route('aep/v1', '/discussions/(?P<id>\d+)/messages', [
            'methods' => 'POST',
            'callback' => [$this, 'add_message'],
            'permission_callback' => [$this, 'check_permission']
        ]);
    }
}
```

## Shortcode Implementation
```php
class AEP_Public {
    public function discussion_shortcode($atts) {
        $atts = shortcode_atts([
            'discussion_id' => 0,
            'height' => '500px'
        ], $atts);
        
        wp_enqueue_script('aep-discussion');
        wp_enqueue_style('aep-discussion');
        
        ob_start();
        include plugin_dir_path(__FILE__) . 'views/discussion.php';
        return ob_get_clean();
    }
}
```

## Frontend Integration
```javascript
// discussion.js
class AEPDiscussion {
    constructor(containerId, discussionId) {
        this.container = document.getElementById(containerId);
        this.discussionId = discussionId;
        this.setup();
    }
    
    async setup() {
        this.setupWebSocket();
        await this.loadMessages();
        this.setupEventListeners();
    }
    
    async loadMessages() {
        const response = await fetch(`/wp-json/aep/v1/discussions/${this.discussionId}/messages`);
        const messages = await response.json();
        this.renderMessages(messages);
    }
}
```

## Admin Interface
```php
class AEP_Admin {
    public function add_menu_pages() {
        add_menu_page(
            'AI Expert Panel',
            'Expert Panel',
            'manage_options',
            'ai-expert-panel',
            [$this, 'render_dashboard'],
            'dashicons-groups'
        );
        
        add_submenu_page(
            'ai-expert-panel',
            'Settings',
            'Settings',
            'manage_options',
            'ai-expert-panel-settings',
            [$this, 'render_settings']
        );
    }
}
```

## Installation Process
```php
class AEP_Installer {
    public static function activate() {
        self::create_tables();
        self::add_default_experts();
        self::set_default_options();
        
        flush_rewrite_rules();
    }
    
    private static function create_tables() {
        global $wpdb;
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        // Execute table creation SQL
    }
}
```

## Security Measures
```php
class AEP_Security {
    public static function validate_request($request) {
        if (!wp_verify_nonce($request->get_header('X-WP-Nonce'), 'wp_rest')) {
            return new WP_Error('invalid_nonce', 'Invalid nonce', ['status' => 403]);
        }
        
        if (!current_user_can('participate_in_discussions')) {
            return new WP_Error('forbidden', 'Access denied', ['status' => 403]);
        }
        
        return true;
    }
}
```
