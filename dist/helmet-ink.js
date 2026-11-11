(() => {
  'use strict';
  // Traced in the coordinate system of the supplied 1448 × 1086 helmet photo.
  // Only helmet parts are included: no hair, face, shoulders or invented shell.
  const shell='M324 652C344 632 376 610 398 584C397 505 417 438 460 386C507 331 573 301 649 294C737 280 816 309 874 361C935 416 968 495 966 581L958 653C944 667 911 674 872 686C832 726 783 764 734 790C686 815 630 834 579 832L508 826C466 815 436 795 420 762L410 740C404 722 416 701 438 680C450 669 456 651 449 642L385 663C351 674 329 669 323 663Q319 658 324 652Z';
  const shield='M481 701C455 712 426 732 413 755C399 779 421 815 450 844L493 881C514 898 537 902 554 885L606 829C565 830 526 814 497 790C477 770 467 736 481 701Z';
  const details=[
    'M326 653C370 668 420 652 468 632C528 608 598 589 675 579',
    'M335 660C377 672 428 655 473 638',
    'M810 339C895 418 921 516 893 628C857 721 759 789 653 820',
    'M419 738C435 774 479 805 517 814C571 837 634 832 690 809',
    'M532 733C518 714 531 685 554 669L607 645C618 661 629 693 614 715C593 738 555 757 532 733Z',
    'M610 646L627 642C639 665 649 692 641 707L626 715',
    'M476 709C465 743 476 773 499 792L540 824L567 810',
    'M421 756C426 787 452 813 480 836L514 867C525 876 538 877 548 868L589 826',
    'M414 782C428 817 463 851 500 878C521 892 538 894 552 883',
    'M410 493C414 509 424 522 435 528C438 526 435 516 429 508L417 491Q412 486 410 493Z',
    'M432 473C435 489 447 504 455 508C462 508 455 493 450 485L441 472Q434 465 432 473Z',
    'M454 459C459 475 467 485 476 491C483 493 480 482 473 472L463 457Q456 452 454 459Z',
    'M552 319C561 314 574 311 587 311L590 315C577 315 563 318 555 322Z',
    'M633 312C649 307 679 307 698 310L703 316C679 313 651 313 636 317Z',
    'M740 330C755 333 771 343 781 354L782 360C768 348 754 340 741 337Z'
  ];
  function buildMesh(light=false){
    const cols=light?24:56,rows=light?22:50,points=[],edges=[];
    const noise=(i,j)=>Math.sin(i*71.73+j*39.19)*Math.cos(i*19.41-j*53.12);
    for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
      const u=i/cols,v=j/rows;
      points.push([
        300+u*710+25*Math.sin(v*Math.PI)*Math.sin(u*Math.PI)+noise(i,j)*3,
        278+v*640+23*Math.sin(u*Math.PI)*Math.sin(v*2.8)+noise(j,i)*2.6
      ]);
    }
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
      const a=i+j*(cols+1),b=a+1,c=a+cols+1,d=c+1;
      edges.push([a,b],[a,c],(i+j)%2?[a,d]:[b,c]);
      if(j===rows-1)edges.push([c,d]);if(i===cols-1)edges.push([b,d]);
    }
    return {points,edges};
  }
  let serial=0;
  function mount(portrait){
    const existing=portrait.querySelector('.hero-helmet-ink');if(existing)return existing.inkController;
    const id='helmet-ink-'+(++serial),svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    const light=!!window.matchMedia?.('(max-width: 600px), (pointer: coarse)').matches || (navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4);
    const mesh=buildMesh(light),line=([a,b])=>`M${mesh.points[a].map(n=>n.toFixed(1)).join(' ')}L${mesh.points[b].map(n=>n.toFixed(1)).join(' ')}`;
    svg.setAttribute('viewBox','0 0 1448 1086');svg.setAttribute('aria-hidden','true');
    svg.classList.add('hero-helmet-ink');svg.dataset.structure='photo-traced-wireframe';
    svg.innerHTML=`<defs>
      <clipPath id="${id}-clip"><path d="${shell}"/><path d="${shield}"/></clipPath>
      <linearGradient id="${id}-scan" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="130" spreadMethod="repeat">
        <stop offset="0" stop-color="#343936" stop-opacity=".008"/>
        <stop offset=".60" stop-color="#343936" stop-opacity=".013"/>
        <stop offset=".85" stop-color="#343936" stop-opacity=".05"/>
        <stop offset="1" stop-color="#343936" stop-opacity=".105"/>
        ${light?'':'<animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="0 130" dur="3.8s" repeatCount="indefinite"/>'}
      </linearGradient>
    </defs>
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="${mesh.edges.map(line).join('')}" clip-path="url(#${id}-clip)" stroke="url(#${id}-scan)" stroke-width=".7"/>
      <path d="${shell}" stroke="#343936" stroke-opacity=".075" stroke-width="1.55"/>
      <path d="${shield}" stroke="#343936" stroke-opacity=".065" stroke-width="1.35"/>
      ${details.map(d=>`<path d="${d}" stroke="#343936" stroke-opacity=".085" stroke-width="1.1"/>`).join('')}
    </g>`;
    portrait.append(svg);let active=true;
    const controller={
      setActive(value){
        value=!!value;if(value===active)return;active=value;
        if(active)svg.unpauseAnimations?.();else svg.pauseAnimations?.();
        svg.dataset.motion=active?(light?'static':'scanning'):'paused';
      },
      setThumbnail(progress){svg.style.opacity=String(Math.max(0,1-progress)**1.5);},
      remove(){svg.remove();}
    };
    svg.dataset.quality=light?'compact':'fine';svg.dataset.motion=light?'static':'scanning';svg.inkController=controller;return controller;
  }
  window.HelmetInk={mount,buildMesh,outline:{shell,shield,details}};
})();
