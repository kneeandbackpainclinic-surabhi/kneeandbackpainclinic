/**
 * Clinical Health Guides & Blog Interactions
 * Dr. Surabhi Vaidya · Charak Health Solutions, Thane West
 * Safe attribution, patient-education FAQ accordion, and non-conversion analytics.
 */

(function () {
  'use strict';

  // 1. UTM & Attribution Preservation
  function initAttribution() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'];
      utmKeys.forEach(key => {
        const val = urlParams.get(key);
        if (val) {
          sessionStorage.setItem(`lead_${key}`, val);
        }
      });
    } catch (e) {
      console.warn('Attribution preservation notice:', e);
    }
  }

  // 2. Safe Analytics Tracking (Zero False Conversions)
  function trackBlogEvent(eventName, params = {}) {
    try {
      const dedupeKey = `blog_event_${eventName}_${params.article_slug || 'index'}`;
      if (sessionStorage.getItem(dedupeKey) && eventName === 'blog_article_view') {
        return; // Deduplicate article view in current session
      }

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: eventName,
        ...params,
        timestamp: new Date().toISOString()
      });

      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
      }

      if (eventName === 'blog_article_view') {
        sessionStorage.setItem(dedupeKey, 'true');
      }
      console.log(`[Blog Tracking] Dispatched: ${eventName}`, params);
    } catch (err) {
      console.warn('[Blog Tracking] Notice:', err);
    }
  }

  // 3. Setup Interactive FAQ Accordion
  function setupFaqAccordion() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const item = btn.closest('.faq-item');
        if (!item) return;

        const isOpen = item.classList.contains('active') || item.classList.contains('open');

        // Close all other FAQs in the container
        const parent = item.parentElement;
        if (parent) {
          parent.querySelectorAll('.faq-item').forEach(other => {
            other.classList.remove('active', 'open');
            other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
          });
        }

        if (!isOpen) {
          item.classList.add('active', 'open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // 4. Track Consultation CTA Clicks
  function setupCtaTracking() {
    document.querySelectorAll('.btn-blog-cta, .btn-open-booking').forEach(btn => {
      btn.addEventListener('click', () => {
        const articleSlug = document.body.dataset.articleSlug || 'blog_index';
        const ctaPos = btn.dataset.position || 'in_article_card';
        const ctaText = (btn.textContent || '').trim();

        trackBlogEvent('blog_consultation_cta_click', {
          article_slug: articleSlug,
          cta_position: ctaPos,
          cta_text: ctaText
        });
      });
    });
  }

  // 5. Sticky Consultation Bar Visibility
  function setupStickyBar() {
    const stickyBar = document.getElementById('sticky-booking-bar');
    if (!stickyBar) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        stickyBar.classList.add('visible');
      } else {
        stickyBar.classList.remove('visible');
      }
    }, { passive: true });
  }

  // 6. DOM Initialization
  document.addEventListener('DOMContentLoaded', () => {
    initAttribution();
    setupFaqAccordion();
    setupCtaTracking();
    setupStickyBar();

    const articleSlug = document.body.dataset.articleSlug;
    if (articleSlug) {
      const articleTitle = document.querySelector('h1')?.textContent?.trim() || articleSlug;
      trackBlogEvent('blog_article_view', {
        article_slug: articleSlug,
        article_title: articleTitle,
        content_category: 'patient_education'
      });
    } else {
      trackBlogEvent('blog_index_view', {
        content_category: 'patient_education'
      });
    }
  });

})();
