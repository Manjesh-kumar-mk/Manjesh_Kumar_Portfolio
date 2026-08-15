   console.log('script.js loaded');
   const header=document.getElementById('header');
   const backToTop=document.getElementById('backToTop');
    const menuBtn=document.getElementById('menuBtn');
    const navLinks=document.getElementById('navLinks');
    const themeToggle=document.getElementById('themeToggle');

    window.addEventListener('load',()=>{
      setTimeout(()=>{document.getElementById('loader').style.opacity='0';
        document.getElementById('loader').style.pointerEvents='none';
      },500);
    });

    window.addEventListener('scroll',()=>{
      header.classList.toggle('scrolled',window.scrollY>20);
      backToTop.classList.toggle('show',window.scrollY>500);
      updateActiveNav();
    });

    backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

    menuBtn.addEventListener('click',()=>navLinks.classList.toggle('open'));
    document.querySelectorAll('.nav-links a').forEach(a=>{
      a.addEventListener('click',()=>navLinks.classList.remove('open'));
    });

    const sections=[...document.querySelectorAll('section')];
    const navItems=[...document.querySelectorAll('.nav-links a')];

    function updateActiveNav(){
      let current='home';
      sections.forEach(sec=>{
        const top=sec.offsetTop-120;
        if(window.scrollY>=top) current=sec.id;
      });
      navItems.forEach(a=>{
        a.classList.toggle('active',a.getAttribute('href')==='#'+current);
      });
    }

    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('show');

          entry.target.querySelectorAll('.progress span').forEach(bar=>{
            bar.style.width=bar.dataset.width;
          });
          

          entry.target.querySelectorAll('.counter').forEach(counter=>{
            if(counter.dataset.done) return;
            counter.dataset.done=true;
            const target=+counter.dataset.target;
            let value=0;
            const step=Math.max(1,Math.ceil(target/60));
            const timer=setInterval(()=>{
              value+=step;
              if(value>=target){
                value=target;
                clearInterval(timer);
              }
              counter.textContent=value;
            },20);
          });
        }
      });
    },{threshold:.15});

    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

    const words=[
      'Software Developer',
      'Backend Developer',
      'Python Enthusiast',
      'Java Developer',
      'FastAPI Builder'
    ];
    const typing=document.getElementById('typing');
    let wi=0,ci=0,deleting=false;

    function typeLoop(){
      const word=words[wi];
      typing.textContent=word.substring(0,ci);

      if(!deleting && ci<word.length){
        ci++;
        setTimeout(typeLoop,90);
      }else if(deleting && ci>0){
        ci--;
        setTimeout(typeLoop,45);
      }else{
        deleting=!deleting;
        if(!deleting) wi=(wi+1)%words.length;
        setTimeout(typeLoop,deleting?1200:250);
      }
    }
    typeLoop();

    const filterBtns=document.querySelectorAll('.filter-btn');
    const projects=document.querySelectorAll('.project');

    filterBtns.forEach(btn=>{
      btn.addEventListener('click',()=>{
        filterBtns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const filter=btn.dataset.filter;
        projects.forEach(card=>{
          card.style.display=(filter==='all'||card.dataset.category===filter)?'block':'none';
        });
      });
    });

    // ===============================
// Contact form (no OTP)
// ===============================

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');

    if (!form) {
        console.error('contactForm not found');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form intercepted');

        const data = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            message: document.getElementById('message').value.trim()
        };

        try {
            const response = await fetch('/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            alert(result.message || result.detail);

        } catch (err) {
            console.error(err);
            alert('Request failed');
        }
    });
});

// ===============================
// Popup
// ===============================

const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popupMessage');
const popupClose = document.getElementById('popupClose');

function showPopup(message) {
    popupMessage.textContent = message;
    popup.classList.remove('hidden');
}

popupClose.addEventListener('click', () => {
    popup.classList.add('hidden');
});