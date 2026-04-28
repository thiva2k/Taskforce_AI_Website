<?php
/**
 * Plugin Name: TaskForce AI ACF Field Groups
 * Description: Registers all ACF field groups for the TaskForce AI website
 * Version: 1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'acf/init', function () {

    if ( ! function_exists( 'acf_add_local_field_group' ) ) {
        return;
    }

    // ─── 1. Office Fields (Post Type: office) ───────────────────────────

    acf_add_local_field_group( array(
        'key'            => 'group_office_fields',
        'title'          => 'Office Fields',
        'fields'         => array(
            array(
                'key'   => 'field_office_country',
                'label' => 'Country',
                'name'  => 'country',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_office_city',
                'label' => 'City',
                'name'  => 'city',
                'type'  => 'text',
            ),
        ),
        'location'       => array(
            array(
                array(
                    'param'    => 'post_type',
                    'operator' => '==',
                    'value'    => 'office',
                ),
            ),
        ),
        'menu_order'     => 0,
        'position'       => 'normal',
        'style'          => 'default',
        'label_placement'=> 'top',
        'active'         => true,
        'show_in_rest'   => 1,
    ) );

    // ─── 2. Service Fields (Post Type: service) ─────────────────────────

    acf_add_local_field_group( array(
        'key'            => 'group_service_fields',
        'title'          => 'Service Fields',
        'fields'         => array(
            array(
                'key'   => 'field_service_short_description',
                'label' => 'Short Description',
                'name'  => 'short_description',
                'type'  => 'textarea',
                'rows'  => 3,
            ),
            array(
                'key'          => 'field_service_top_use_cases',
                'label'        => 'Top Use Cases',
                'name'         => 'top_use_cases',
                'type'         => 'textarea',
                'rows'         => 3,
                'instructions' => 'Comma-separated list of use cases.',
            ),
            array(
                'key'   => 'field_service_button_text',
                'label' => 'Button Text',
                'name'  => 'button_text',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_service_button_link',
                'label' => 'Button Link',
                'name'  => 'button_link',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_service_status_text',
                'label' => 'Status Text',
                'name'  => 'status_text',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_service_unit_code',
                'label' => 'Unit Code',
                'name'  => 'unit_code',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_service_icon_name',
                'label' => 'Icon Name',
                'name'  => 'icon_name',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_service_inner_hero_title',
                'label' => 'Inner Hero Title',
                'name'  => 'inner_hero_title',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_service_inner_hero_short_desc',
                'label' => 'Inner Hero Short Description',
                'name'  => 'inner_hero_short_desc',
                'type'  => 'textarea',
                'rows'  => 3,
            ),
            array(
                'key'   => 'field_service_inner_hero_long_desc',
                'label' => 'Inner Hero Long Description',
                'name'  => 'inner_hero_long_desc',
                'type'  => 'textarea',
                'rows'  => 5,
            ),
            array(
                'key'   => 'field_service_inner_primary_button_text',
                'label' => 'Inner Primary Button Text',
                'name'  => 'inner_primary_button_text',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_service_inner_primary_button_link',
                'label' => 'Inner Primary Button Link',
                'name'  => 'inner_primary_button_link',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_service_inner_secondary_button_text',
                'label' => 'Inner Secondary Button Text',
                'name'  => 'inner_secondary_button_text',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_service_inner_secondary_button_link',
                'label' => 'Inner Secondary Button Link',
                'name'  => 'inner_secondary_button_link',
                'type'  => 'text',
            ),
        ),
        'location'       => array(
            array(
                array(
                    'param'    => 'post_type',
                    'operator' => '==',
                    'value'    => 'service',
                ),
            ),
        ),
        'menu_order'     => 0,
        'position'       => 'normal',
        'style'          => 'default',
        'label_placement'=> 'top',
        'active'         => true,
        'show_in_rest'   => 1,
    ) );

    // ─── 3. Process Step Fields (Post Type: process_steps) ──────────────

    acf_add_local_field_group( array(
        'key'            => 'group_process_step_fields',
        'title'          => 'Process Step Fields',
        'fields'         => array(
            array(
                'key'   => 'field_process_small_label',
                'label' => 'Small Label',
                'name'  => 'small_label',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_process_step_number',
                'label' => 'Step Number',
                'name'  => 'step_number',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_process_short_description',
                'label' => 'Short Description',
                'name'  => 'short_description',
                'type'  => 'textarea',
                'rows'  => 3,
            ),
            array(
                'key'   => 'field_process_icon_name',
                'label' => 'Icon Name',
                'name'  => 'icon_name',
                'type'  => 'text',
            ),
        ),
        'location'       => array(
            array(
                array(
                    'param'    => 'post_type',
                    'operator' => '==',
                    'value'    => 'process_steps',
                ),
            ),
        ),
        'menu_order'     => 0,
        'position'       => 'normal',
        'style'          => 'default',
        'label_placement'=> 'top',
        'active'         => true,
        'show_in_rest'   => 1,
    ) );

    // ─── 4. Stat Fields (Post Type: stat) ───────────────────────────────

    acf_add_local_field_group( array(
        'key'            => 'group_stat_fields',
        'title'          => 'Stat Fields',
        'fields'         => array(
            array(
                'key'   => 'field_stat_value',
                'label' => 'Value',
                'name'  => 'value',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_stat_title_text',
                'label' => 'Title Text',
                'name'  => 'title_text',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_stat_subtitle',
                'label' => 'Subtitle',
                'name'  => 'subtitle',
                'type'  => 'text',
            ),
        ),
        'location'       => array(
            array(
                array(
                    'param'    => 'post_type',
                    'operator' => '==',
                    'value'    => 'stat',
                ),
            ),
        ),
        'menu_order'     => 0,
        'position'       => 'normal',
        'style'          => 'default',
        'label_placement'=> 'top',
        'active'         => true,
        'show_in_rest'   => 1,
    ) );

    // ─── 5. Team Member Fields (Post Type: team) ────────────────────────

    acf_add_local_field_group( array(
        'key'            => 'group_team_fields',
        'title'          => 'Team Member Fields',
        'fields'         => array(
            array(
                'key'   => 'field_team_name',
                'label' => 'Name',
                'name'  => 'name',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_team_role',
                'label' => 'Role',
                'name'  => 'role',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_team_description',
                'label' => 'Description',
                'name'  => 'description',
                'type'  => 'textarea',
                'rows'  => 4,
            ),
        ),
        'location'       => array(
            array(
                array(
                    'param'    => 'post_type',
                    'operator' => '==',
                    'value'    => 'team',
                ),
            ),
        ),
        'menu_order'     => 0,
        'position'       => 'normal',
        'style'          => 'default',
        'label_placement'=> 'top',
        'active'         => true,
        'show_in_rest'   => 1,
    ) );

    // ─── 6. Home Page Fields (Post Type: page) ──────────────────────────

    acf_add_local_field_group( array(
        'key'            => 'group_home_page_fields',
        'title'          => 'Home Page Fields',
        'fields'         => array(
            array(
                'key'   => 'field_home_hero_badge',
                'label' => 'Hero Badge',
                'name'  => 'hero_badge',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_home_hero_title',
                'label' => 'Hero Title',
                'name'  => 'hero_title',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_home_hero_description',
                'label' => 'Hero Description',
                'name'  => 'hero_description',
                'type'  => 'textarea',
                'rows'  => 4,
            ),
            array(
                'key'   => 'field_home_hero_primary_button_text',
                'label' => 'Hero Primary Button Text',
                'name'  => 'hero_primary_button_text',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_home_hero_primary_button_link',
                'label' => 'Hero Primary Button Link',
                'name'  => 'hero_primary_button_link',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_home_hero_secondary_button_text',
                'label' => 'Hero Secondary Button Text',
                'name'  => 'hero_secondary_button_text',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_home_hero_secondary_button_link',
                'label' => 'Hero Secondary Button Link',
                'name'  => 'hero_secondary_button_link',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_home_process_section_badge',
                'label' => 'Process Section Badge',
                'name'  => 'process_section_badge',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_home_process_section_title',
                'label' => 'Process Section Title',
                'name'  => 'process_section_title',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_home_process_section_description',
                'label' => 'Process Section Description',
                'name'  => 'process_section_description',
                'type'  => 'textarea',
                'rows'  => 4,
            ),
            array(
                'key'          => 'field_home_cta_content',
                'label'        => 'CTA Content',
                'name'         => 'cta_content',
                'type'         => 'textarea',
                'rows'         => 6,
                'instructions' => 'Format: one key:value per line. Keys: badge, title, description, button text.',
            ),
            array(
                'key'   => 'field_home_cta_button_link',
                'label' => 'CTA Button Link',
                'name'  => 'cta_button_link',
                'type'  => 'text',
            ),
        ),
        'location'       => array(
            array(
                array(
                    'param'    => 'post_type',
                    'operator' => '==',
                    'value'    => 'page',
                ),
            ),
        ),
        'menu_order'     => 0,
        'position'       => 'normal',
        'style'          => 'default',
        'label_placement'=> 'top',
        'active'         => true,
        'show_in_rest'   => 1,
    ) );

    // ─── 7. About Page Fields (Post Type: page) ────────────────────────

    acf_add_local_field_group( array(
        'key'            => 'group_about_page_fields',
        'title'          => 'About Page Fields',
        'fields'         => array(
            array(
                'key'   => 'field_about_section_tagline',
                'label' => 'Section Tagline',
                'name'  => 'section_tagline',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_about_main_heading',
                'label' => 'Main Heading',
                'name'  => 'main_heading',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_about_headquarters_description',
                'label' => 'Headquarters Description',
                'name'  => 'headquarters_description',
                'type'  => 'textarea',
                'rows'  => 4,
            ),
            array(
                'key'   => 'field_about_company_overview',
                'label' => 'Company Overview',
                'name'  => 'company_overview',
                'type'  => 'textarea',
                'rows'  => 4,
            ),
            array(
                'key'   => 'field_about_augmentation_title',
                'label' => 'Augmentation Title',
                'name'  => 'augmentation_title',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_about_augmentation_description',
                'label' => 'Augmentation Description',
                'name'  => 'augmentation_description',
                'type'  => 'textarea',
                'rows'  => 5,
            ),
            array(
                'key'          => 'field_about_augmentation_points',
                'label'        => 'Augmentation Points',
                'name'         => 'augmentation_points',
                'type'         => 'textarea',
                'rows'         => 3,
                'instructions' => 'Comma-separated list of augmentation bullet points.',
            ),
            array(
                'key'   => 'field_about_core1_title',
                'label' => 'Core Value 1 Title',
                'name'  => 'core1_title',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_about_core1_desc',
                'label' => 'Core Value 1 Description',
                'name'  => 'core1_desc',
                'type'  => 'textarea',
                'rows'  => 3,
            ),
            array(
                'key'   => 'field_about_core2_title',
                'label' => 'Core Value 2 Title',
                'name'  => 'core2_title',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_about_core2_desc',
                'label' => 'Core Value 2 Description',
                'name'  => 'core2_desc',
                'type'  => 'textarea',
                'rows'  => 3,
            ),
            array(
                'key'   => 'field_about_core3_title',
                'label' => 'Core Value 3 Title',
                'name'  => 'core3_title',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_about_core3_desc',
                'label' => 'Core Value 3 Description',
                'name'  => 'core3_desc',
                'type'  => 'textarea',
                'rows'  => 3,
            ),
            array(
                'key'   => 'field_about_stat1_label',
                'label' => 'Stat 1 Label',
                'name'  => 'stat1_label',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_about_stat1_value',
                'label' => 'Stat 1 Value',
                'name'  => 'stat1_value',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_about_stat2_label',
                'label' => 'Stat 2 Label',
                'name'  => 'stat2_label',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_about_stat2_value',
                'label' => 'Stat 2 Value',
                'name'  => 'stat2_value',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_about_stat3_label',
                'label' => 'Stat 3 Label',
                'name'  => 'stat3_label',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_about_stat3_value',
                'label' => 'Stat 3 Value',
                'name'  => 'stat3_value',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_about_stat4_label',
                'label' => 'Stat 4 Label',
                'name'  => 'stat4_label',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_about_stat4_value',
                'label' => 'Stat 4 Value',
                'name'  => 'stat4_value',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_about_cta_title',
                'label' => 'CTA Title',
                'name'  => 'cta_title',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_about_cta_button1',
                'label' => 'CTA Button 1 Text',
                'name'  => 'cta_button1',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_about_cta_button2',
                'label' => 'CTA Button 2 Text',
                'name'  => 'cta_button2',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_about_cta_buttonlink1',
                'label' => 'CTA Button 1 Link',
                'name'  => 'cta_buttonlink1',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_about_cta_buttonlink2',
                'label' => 'CTA Button 2 Link',
                'name'  => 'cta_buttonlink2',
                'type'  => 'text',
            ),
        ),
        'location'       => array(
            array(
                array(
                    'param'    => 'post_type',
                    'operator' => '==',
                    'value'    => 'page',
                ),
            ),
        ),
        'menu_order'     => 10,
        'position'       => 'normal',
        'style'          => 'default',
        'label_placement'=> 'top',
        'active'         => true,
        'show_in_rest'   => 1,
    ) );

    // ─── 8. Blog Post Fields (Post Type: post) ─────────────────────────

    acf_add_local_field_group( array(
        'key'            => 'group_blog_post_fields',
        'title'          => 'Blog Post Fields',
        'fields'         => array(
            array(
                'key'          => 'field_post_service_slug',
                'label'        => 'Service Slug',
                'name'         => 'service_slug',
                'type'         => 'text',
                'instructions' => 'Links this post to a service (e.g. "ai-agents").',
            ),
            array(
                'key'          => 'field_post_item_order',
                'label'        => 'Item Order',
                'name'         => 'item_order',
                'type'         => 'text',
                'instructions' => 'Numeric sort order within a service section.',
            ),
            array(
                'key'   => 'field_post_icon_name',
                'label' => 'Icon Name',
                'name'  => 'icon_name',
                'type'  => 'text',
            ),
            array(
                'key'   => 'field_post_author_name',
                'label' => 'Author Name',
                'name'  => 'author_name',
                'type'  => 'text',
            ),
            array(
                'key'          => 'field_post_blog_author_name',
                'label'        => 'Blog Author Name',
                'name'         => 'blog_author_name',
                'type'         => 'text',
                'instructions' => 'Overrides author_name for blog display.',
            ),
            array(
                'key'   => 'field_post_publish_date',
                'label' => 'Publish Date',
                'name'  => 'publish_date',
                'type'  => 'text',
            ),
            array(
                'key'          => 'field_post_blog_publish_date',
                'label'        => 'Blog Publish Date',
                'name'         => 'blog_publish_date',
                'type'         => 'text',
                'instructions' => 'Overrides publish_date for blog display.',
            ),
            array(
                'key'   => 'field_post_reading_time',
                'label' => 'Reading Time',
                'name'  => 'reading_time',
                'type'  => 'text',
            ),
            array(
                'key'          => 'field_post_read_time',
                'label'        => 'Read Time',
                'name'         => 'read_time',
                'type'         => 'text',
                'instructions' => 'Fallback for reading_time (e.g. "5 min read").',
            ),
        ),
        'location'       => array(
            array(
                array(
                    'param'    => 'post_type',
                    'operator' => '==',
                    'value'    => 'post',
                ),
            ),
        ),
        'menu_order'     => 0,
        'position'       => 'normal',
        'style'          => 'default',
        'label_placement'=> 'top',
        'active'         => true,
        'show_in_rest'   => 1,
    ) );

} );
