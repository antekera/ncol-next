import React from 'react'

import Script from 'next/script'

const GaScript = () => {
  return (
    <>
      {/* Data layer */}
      <Script id='g-data-layer' strategy='afterInteractive'>
        {`
            window.dataLayer = window.dataLayer || [];
            dataLayer.push({
                'event': 'Pageview',
                'pagePath': 'https://www.noticiascol.com',
                'pageTitle': '/HOME',
            });
          `}
      </Script>
      {/* Tag Manager */}
      <Script id='tag-manager' strategy='afterInteractive'>
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-KSDFW3');
          `}
      </Script>
      {/* Ad Tags */}
      {/*<Script
        id='ad-tags'
        strategy='afterInteractive'
        src='https://securepubads.g.doubleclick.net/tag/js/gpt.js'
      />*/}
      {/* Define ad slots */}
      {/*<Script id='ads-slots' strategy='afterInteractive'>
        {`
            window.googletag = window.googletag || {cmd: []};
            googletag.cmd.push(function() {
            googletag.defineSlot('/12217521/banner_principal', [1000, 250], 'div-gpt-ad-1375726212048-0').addService(googletag.pubads());
            googletag.defineSlot('/12217521/intermedio_2', [1000, 250], 'div-gpt-ad-1375726212048-2').addService(googletag.pubads());
            googletag.defineSlot('/12217521/lateral_a1', [300, 250], 'div-gpt-ad-${AD_LATERAL_A1}').addService(googletag.pubads());
            googletag.defineSlot('/12217521/lateral_a2', [300, 250], 'div-gpt-ad-${AD_LATERAL_A2}').addService(googletag.pubads());
            googletag.defineSlot('/12217521/lateral_a3', [300, 250], 'div-gpt-ad-1375726212048-11').addService(googletag.pubads());
            googletag.defineSlot('/12217521/lateral_c1', [300, 250], 'div-gpt-ad-${AD_LATERAL_B1}').addService(googletag.pubads());
            googletag.defineSlot('/12217521/lateral_d1', [300, 250], 'div-gpt-ad-${AD_LATERAL_D1}').addService(googletag.pubads());
            googletag.defineSlot('/12217521/torre_1', [300, 600], 'div-gpt-ad-1375726212048-20').addService(googletag.pubads());
            googletag.defineSlot('/12217521/horizontal_a', [970, 90], 'div-gpt-ad-${AD_INTERMEDIO_2}').addService(googletag.pubads());
            googletag.defineSlot('/12217521/horizontal_b', [970, 90], 'div-gpt-ad-1378488224258-1').addService(googletag.pubads());
            googletag.pubads().enableSingleRequest();
            googletag.enableServices();
          });
          `}
      </Script>*/}
      {/* Taboola */}
      {/* <Script id='taboola' strategy='afterInteractive'>
        {`
        window._taboola = window._taboola || [];
          _taboola.push({article:'auto'});
          !function (e, f, u, i) {
            if (!document.getElementById(i)){
              e.async = 1;
              e.src = u;
              e.id = i;
              f.parentNode.insertBefore(e, f);
            }
          }(document.createElement('script'),
            document.getElementsByTagName('script')[0],
            '//cdn.taboola.com/libtrc/noticiascol-noticiascol/loader.js',
            'tb_loader_script');
          if(window.performance && typeof window.performance.mark == 'function')
          {window.performance.mark('tbl_ic');}
          `}
      </Script>*/}
      {/* G automatic ads */}
      <Script
        id='automatic-ad'
        strategy='afterInteractive'
        src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6715059182926587'
      />
    </>
  )
}

export { GaScript }
