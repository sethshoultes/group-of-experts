# AI Expert Panel - WordPress Plugin Build Plan

## Project Summary
WordPress plugin implementing AI expert panel discussions using Claude API for expert responses. Supports threaded discussions, expert profiles, and moderation.

## Development Environment
```bash
# Required tools
- PHP 8.1+
- WordPress 6.4+
- Composer
- Node.js 18+
- npm
```

## Build Steps

### 1. Initial Setup (Week 1)
```bash
# Create plugin structure
mkdir ai-expert-panel
cd ai-expert-panel

# Initialize package managers
composer init
npm init

# Install dependencies
composer require anthropic/anthropic-php
npm install @wordpress/scripts
```

### 2. Core Development (Week 2-3)

#### Database
```sql
-- Run during plugin activation
CREATE TABLE `{$wpdb->prefix}aep_experts` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `role` varchar(50) NOT NULL,
  `expertise` text NOT NULL,
  `prompt_template` text NOT NULL,
  `system_context` text NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
);

-- Additional tables for discussions and messages
```

#### Core Classes
```php
// ai-expert-panel.php
register_activation_hook(__FILE__, ['AEP_Installer', 'activate']);
add_action('plugins_loaded', ['AEP_Core', 'init']);

// includes/class-ai-client.php
class AEP_AI_Client {
    private $api_key;
    private $model = 'claude-3-sonnet-20240229';
    
    public function generate_response($expert, $prompt) {
        // Claude API integration
    }
}
```

### 3. Admin Interface (Week 4)

#### Settings Page
```php
// admin/class-admin.php
class AEP_Admin {
    public function register_settings() {
        register_setting('aep_options', 'aep_claude_api_key');
        register_setting('aep_options', 'aep_default_experts');
    }
}
```

#### Expert Management
```php
// admin/views/experts.php
<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    <form method="post" action="options.php">
        <?php settings_fields('aep_options'); ?>
        // Expert configuration form
    </form>
</div>
```

### 4. Frontend Development (Week 5-6)

#### Discussion Interface
```javascript
// public/js/discussion.js
class AEPDiscussion {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.setupWebSocket();
        this.init();
    }
    
    async init() {
        await this.loadMessages();
        this.bindEvents();
    }
}
```

#### Styles
```css
/* public/css/discussion.css */
.aep-discussion {
    max-width: 800px;
    margin: 0 auto;
}

.aep-message {
    margin: 1rem 0;
    padding: 1rem;
    border-radius: 4px;
}
```

### 5. API Integration (Week 7)

#### REST API Routes
```php
// includes/class-api-handler.php
class AEP_API_Handler {
    public function register_routes() {
        register_rest_route('aep/v1', '/discussions', [
            'methods' => 'POST',
            'callback' => [$this, 'create_discussion'],
            'permission_callback' => [$this, 'check_permission']
        ]);
    }
}
```

### 6. Testing & Documentation (Week 8)

#### PHPUnit Tests
```php
// tests/test-discussion.php
class AEP_Discussion_Test extends WP_UnitTestCase {
    public function test_create_discussion() {
        $discussion = new AEP_Discussion();
        $result = $discussion->create(['topic' => 'Test']);
        $this->assertNotEmpty($result);
    }
}
```

## File Structure
```
ai-expert-panel/
├── admin/
│   ├── class-admin.php
│   ├── js/
│   └── views/
├── includes/
│   ├── class-api-handler.php
│   ├── class-discussion.php
│   └── class-ai-client.php
├── public/
│   ├── js/
│   └── css/
└── tests/
```

## Development Commands
```bash
# Start development
npm run start

# Build for production
npm run build

# Run tests
composer test

# Create release
npm run build && zip -r ai-expert-panel.zip . -x "node_modules/*" "tests/*"
```

## Key Features
1. Expert profile management
2. Real-time discussions
3. Claude API integration
4. Threaded messages
5. Moderation tools
6. Settings management

## Security Considerations
1. Nonce verification
2. API key encryption
3. User capability checks
4. Input sanitization
5. XSS prevention

## Performance Optimizations
1. Message caching
2. Batch API requests
3. Asset minification
4. Database indexing
5. Lazy loading
