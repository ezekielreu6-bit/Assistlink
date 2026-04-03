import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  
  const widgetScript = `
(function() {
  var AssistLink = {
    init: function(config) {
      this.config = config;
      this.render();
    },
    render: function() {
     
      var container = document.createElement('div');
      container.id = 'assistlink-widget-container';
      container.style.position = 'fixed';
      container.style.bottom = '20px';
      container.style.right = '20px';
      container.style.zIndex = '999999';
      document.body.appendChild(container);

     
      var iframe = document.createElement('iframe');
      this.iframe = iframe;
      
     
      var baseUrl = "${process.env.NEXT_PUBLIC_APP_URL || 'https://assistlink-bit.vercel.app'}/widget-ui";
      var params = new URLSearchParams({
        id: this.config.orgId,
        primary: this.config.primaryColor.replace('#', ''),
        accent: this.config.accentColor.replace('#', ''),
      });
      
      iframe.src = baseUrl + '?' + params.toString();
      iframe.style.width = '400px';
      iframe.style.height = '600px';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '16px';
      iframe.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      iframe.style.display = 'none';
      iframe.style.transition = 'all 0.3s ease';
      
      
      var button = document.createElement('button');
      button.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>';
      button.style.width = '60px';
      button.style.height = '60px';
      button.style.borderRadius = '30px';
      button.style.backgroundColor = this.config.primaryColor;
      button.style.border = 'none';
      button.style.cursor = 'pointer';
      button.style.display = 'flex';
      button.style.alignItems = 'center';
      button.style.justifyContent = 'center';
      button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
      button.style.marginTop = '10px';
      button.style.float = 'right';

      var isOpen = false;
      button.onclick = function() {
        isOpen = !isOpen;
        iframe.style.display = isOpen ? 'block' : 'none';
        button.style.backgroundColor = isOpen ? '#666' : config.primaryColor;
      };

      container.appendChild(iframe);
      container.appendChild(button);
    }
  };
  window.AssistLink = AssistLink;
})();
  `;

  return new NextResponse(widgetScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}