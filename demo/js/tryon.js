// Button 

let tryon = document.getElementById('tryon'); 

const a = document.createElement('a');
const img = document.createElement('img')

if( /iPhone|iPad/i.test(navigator.userAgent) && /AppleWebKit/i.test(navigator.userAgent)) {

    const model = 'demo/111.reality'
    const modelScaling = '1'
    const bannerURL = '192.168.0.28:5500/demo/banner.html'
    const bannerSize = 'medium'
    const shareURL = 'https://www.lesslens.com/demo.html'
    const bannerLink = 'https://apps.apple.com/app/apple-store/id1535675035?pt=122143363&ct=landing&mt=8'
    const href = model + '#allowsContentScaling=' + modelScaling + '&custom=' + bannerURL + '&customHeight=' + bannerSize + '&canonicalWebPageURL=' + shareURL

    a.innerHTML = 'Virtual Try-on';
    a.id = 'tryon';
    a.rel='ar';
    a.href = href;
    tryon.appendChild(a);
    a.appendChild(img)

    a.addEventListener("message", function (event) { 
    if (event.data == "_apple_ar_quicklook_button_tapped") {
        window.location.href = bannerLink ;
    }
    }, false);


} else {

    img.src = 'demo/img/111-qr.png'
    img.alt = 'QR code'
    tryon.appendChild(img)

    
}