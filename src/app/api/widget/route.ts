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

  // Create floating button (bottom right)
  var button = document.createElement('button');
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.right = '20px';
  button.style.width = '60px';
  button.style.height = '60px';
  button.style.borderRadius = '50%';
  button.style.backgroundColor = config.primaryColor;
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
  button.style.cursor = 'pointer';
  button.style.zIndex = '999999';
  button.style.fontSize = '28px';
  button.innerHTML = '💬';
  
  document.body.appendChild(button);

  var widget = null;
  var isOpen = false;

  button.onclick = function() {
    if (isOpen && widget) {
      widget.style.display = 'none';
      isOpen = false;
      return;
    }

    if (!widget) {
      // Create centered widget
      widget = document.createElement('iframe');
      widget.id = 'assistlink-widget';
      widget.src = "https://assistlink-bit.vercel.app/widget-ui?id=" + config.orgId + 
                   "&primary=" + config.primaryColor.replace('#', '') + 
                   "&accent=" + config.accentColor.replace('#', '');
      
      widget.style.position = 'fixed';
      widget.style.top = '50%';
      widget.style.left = '50%';
      widget.style.transform = 'translate(-50%, -50%)';
      widget.style.width = '380px';
      widget.style.height = '500px';           // Compact height
      widget.style.border = 'none';
      widget.style.borderRadius = '24px';
      widget.style.boxShadow = '0 25px 70px -20px rgba(0,0,0,0.45)';
      widget.style.zIndex = '999999';
      widget.style.background = 'white';
      
      document.body.appendChild(widget);
    } else {
      widget.style.display = 'block';
    }

    isOpen = true;
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

      // Update iframe if it exists
      if (widget) {
        widget.src = "https://assistlink-bit.vercel.app/widget-ui?id=" + config.orgId + 
                     "&primary=" + config.primaryColor.replace('#', '') + 
                     "&accent=" + config.accentColor.replace('#', '');
      }
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