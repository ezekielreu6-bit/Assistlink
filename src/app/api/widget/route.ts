import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const widgetScript = `
(function() {
  var config = {
    orgId: "${id}",
    primaryColor: "#3333CC",
    accentColor: "#1FBAF5"
  };

  var container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '999999';
  document.body.appendChild(container);

  var iframe = document.createElement('iframe');
  var baseUrl = "https://assistlink-bit.vercel.app/widget-ui";
  iframe.src = baseUrl + "?id=" + config.orgId + "&primary=" + config.primaryColor.replace('#','') + "&accent=" + config.accentColor.replace('#','');
  iframe.style.width = '420px';
  iframe.style.height = '520px';
  iframe.style.border = 'none';
  iframe.style.display = 'none';
  container.appendChild(iframe);

  var button = document.createElement('button');
  button.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>';
  // FIXED SIZE - NO SHRINK OR EXPAND
  button.style.width = '60px';
  button.style.height = '60px';
  button.style.borderRadius = '50%';
  button.style.backgroundColor = config.primaryColor;
  button.style.border = 'none';
  button.style.cursor = 'pointer';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
  button.style.marginTop = '10px';
  button.style.marginLeft = 'auto';
  container.appendChild(button);

  var isOpen = false;
  button.onclick = function() {
    isOpen = !isOpen;
    iframe.style.display = isOpen ? 'block' : 'none';
  };

  window.AssistLink = {
    init: function(userConfig) {
      if(userConfig.primaryColor) button.style.backgroundColor = userConfig.primaryColor;
      iframe.src = baseUrl + "?id=" + userConfig.orgId + "&primary=" + userConfig.primaryColor.replace('#','') + "&accent=" + userConfig.accentColor.replace('#','');
    }
  };
})();
  `;

  return new NextResponse(widgetScript, {
    headers: { 
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*' 
    },
  });
}