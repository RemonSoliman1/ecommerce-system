import re

with open('app/[locale]/shop/page.js', 'r') as f:
    content = f.read()

# 1. Import
content = re.sub(r"(import \{ useTranslations \} from 'next-intl';)", r"\1\nimport TourTrigger from '@/components/tour/TourTrigger';", content)

# 2. TourTrigger
tour_steps = """      <TourTrigger 
        tourName="shop"
        steps={[
          { element: '#tour-shop-filters', titleKey: 'shop_filters_title', descKey: 'shop_filters_desc', side: 'right' },
          { element: '.tour-wishlist-btn', titleKey: 'wishlist_title', descKey: 'wishlist_desc', side: 'top' },
          { element: '.quickAddBtnArea', titleKey: 'quick_add_title', descKey: 'quick_add_desc', side: 'top' }
        ]}
      />"""

content = re.sub(
    r'return \(\s*<div className="container">',
    f'return (\n    <>\n{tour_steps}\n      <div className="container">',
    content
)

# 3. ShopSidebar
content = re.sub(
    r'(<ShopSidebar)',
    r'<div id="tour-shop-filters">\n            \1',
    content
)
content = re.sub(
    r'(onUpdateParams=\{updateParams\}\s*/>)',
    r'\1\n          </div>',
    content
)

# 4. Fragment closing
content = re.sub(
    r'(\s*</div>\s*</div>\s*</div>\s*\);\s*})',
    r'\n    </div>\n      </div>\n    </div>\n    </>\n  );\n}',
    content
)

with open('app/[locale]/shop/page.js', 'w') as f:
    f.write(content)
print("Done")
