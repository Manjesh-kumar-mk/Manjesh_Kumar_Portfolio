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

    //  Functionality of Contact

    // Contact form with OTP verification

    const form = document.getElementById('contactForm');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    
    // Send OTP
    sendOtpBtn.addEventListener('click', async () => {
      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const message = document.getElementById('message');
      
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (name.value.trim().length < 2) {
          showPopup('Please enter a valid name.');
          return;
      }
    
      if (!emailPattern.test(email.value.trim())) {
          showPopup('Please enter a valid email address.');
          return;
      }
    
      if (message.value.trim().length < 10) {
          showPopup('Message must be at least 10 characters.');
          return;
      }
    
      const data = {
          name: name.value.trim(),
          email: email.value.trim(),
          message: message.value.trim()
      };
    
      // Disable button while sending
      sendOtpBtn.disabled = true;
      sendOtpBtn.textContent = 'Sending...';
      showPopup('Sending OTP, please wait...');
    
      // Create a timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
    
      try {
          const response = await fetch('http://127.0.0.1:8000/send-otp', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(data),
              signal: controller.signal
          });
        
          clearTimeout(timeout);
        
          const result = await response.json();
        
          if (response.ok) {
              showPopup(result.message || 'OTP has been sent successfully to your email.');
          } else {
              showPopup(result.detail || 'Unable to send OTP.');
          }
        
      } catch (error) {
          clearTimeout(timeout);
      
          if (error.name === 'AbortError') {
              showPopup('Request timed out. Please try again.');
          } else {
              console.error(error);
              showPopup('Server connection failed. Please try again later.');
          }
        
      } finally {
          sendOtpBtn.disabled = false;
          sendOtpBtn.textContent = 'Send OTP';
      }
    });  
    
    // Verify OTP and send message
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
    
        const email = document.getElementById('email').value.trim();
        const otp = document.getElementById('otp').value.trim();
    
        if (otp.length !== 6) {
          showPopup('Please enter a valid 6-digit OTP.');
          return;
        }
    
        try {
            const response = await fetch('http://127.0.0.1:8000/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    otp: otp
                })
            });
    
            const result = await response.json();
    
            if (response.ok) {
              showPopup('Your message has been verified and sent successfully.');
              form.reset();
            } else {
              showPopup(result.detail || 'Invalid OTP. Please enter the correct OTP.');
            }
        } catch (error) {
          console.error(error);
          showPopup('Server connection failed. Please try again later.');
        }
    });

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