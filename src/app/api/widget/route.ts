import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const orgId = searchParams.get('id') || '';
  const primaryColor = `#${searchParams.get('primary') || '3333CC'}`;
  const accentColor = `#${searchParams.get('accent') || '1FBAF5'}`;

  const widgetScript = `
(function() {
  // Configuration
  var config = {
    orgId: "${orgId}",
    primaryColor: "${primaryColor}",
    accentColor: "${accentColor}"
  };

  // Create container
  var container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '999999';
  document.body.appendChild(container);

  // Create iframe (the actual widget)
  var iframe = document.createElement('iframe');
  var baseUrl = "https://assistlink-bit.vercel.app/widget-ui";   // Change if your preview route is different
  iframe.src = baseUrl + "?id=" + config.orgId + 
               "&primary=" + config.primaryColor.replace('#', '') + 
               "&accent=" + config.accentColor.replace('#', '');
  iframe.style.width = '380px';
  iframe.style.height = '500px';           // Shortened as requested
  iframe.style.border = 'none';
  iframe.style.borderRadius = '24px';
  iframe.style.boxShadow = '0 20px 60px -15px rgba(0,0,0,0.35)';
  iframe.style.display = 'none';
  container.appendChild(iframe);

  // Create floating button
  var button = document.createElement('button');
  button.innerHTML = '💬';
  button.style.width = '60px';
  button.style.height = '60px';
  button.style.borderRadius = '50%';
  button.style.backgroundColor = config.primaryColor;
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.cursor = 'pointer';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
  button.style.fontSize = '28px';
  button.style.marginTop = '12px';
  button.style.marginLeft = 'auto';
  container.appendChild(button);

  var isOpen = false;

  button.onclick = function() {
    isOpen = !isOpen;
    iframe.style.display = isOpen ? 'block' : 'none';
  };

  // Support for AssistLink.init() 
  window.AssistLink = {
    init: function(newConfig) {
      if (newConfig.orgId) config.orgId = newConfig.orgId;
      if (newConfig.primaryColor) {
        config.primaryColor = newConfig.primaryColor;
        button.style.backgroundColor = newConfig.primaryColor;
      }
      if (newConfig.accentColor) config.accentColor = newConfig.accentColor;

      // Update iframe src
      iframe.src = baseUrl + "?id=" + config.orgId + 
                   "&primary=" + config.primaryColor.replace('#', '') + 
                   "&accent=" + config.accentColor.replace('#', '');
    }
  };
})();
  `;

  return new NextResponse(widgetScript, {
    headers: { 
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    },
  });
}