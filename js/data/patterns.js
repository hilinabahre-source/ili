/* ============================================================
   PATTERN DATA
   ============================================================ */
export let PATTERNS = [
  {
    id:'pattern-2', name:'White Mini Skirt', trend:'Clean Girl', difficulty:'Beginner',
    time:'2-3 hrs', fabric:'Lightweight cotton, twill, or denim', image:'assets/images/9efbbe16addf710e619484c72c59090f.jpg', emoji:'', yardageBase:1,
    base:{waist:76,hip:99,length:28,crotchHeight:74},
    pieces:[
      {
        label:'Front', cut:'Cut 1 on fold', sideSA:0.375, hemSA:0.5, tileOverlap:0.5,
        topFold:{x:0,y:0}, topSide:{x:7,y:0},
        hemFold:{x:0,y:11}, hemSide:{x:9.75,y:11},
        curves:[
          {p0:{x:7,y:0}, c1:{x:8.5156,y:2.5117}, c2:{x:8.7284,y:3.8949}, p3:{x:9,y:6.5}},
          {p0:{x:9,y:6.5}, c1:{x:9.2719,y:7.4721}, c2:{x:9.8226,y:10.2910}, p3:{x:9.75,y:11}}
        ]
      },
      {
        label:'Back', cut:'Cut 1 on fold', sideSA:0.5, hemSA:1, tileOverlap:0.25,
        topFold:{x:0,y:0}, topSide:{x:8,y:0},
        hemFold:{x:0,y:13}, hemSide:{x:10,y:13},
        curves:[
          {p0:{x:8,y:0}, c1:{x:10.9671,y:3.5427}, c2:{x:11.2890,y:9.2114}, p3:{x:10,y:13}}
        ]
      }
    ],
    files:[
      {label:'Front piece (US Letter, printable)', url:'assets/patterns/front_skirt_pattern_US_Letter.pdf'},
      {label:'Back piece (US Letter, printable)', url:'assets/patterns/back_skirt_us_letter_printable.pdf'}
    ],
    steps:[
      {title:'Cut your front piece', text:'Print the front pattern piece and check the 2"x2" test square before assembling the tiled pages. Fold your fabric and place Center Front on the fold. A 3/8" seam allowance is included at the waist and sides, with a 1/2" hem allowance. Cut 1 on the fold.', diagram:'pin'},
      {title:'Cut your back piece', text:'Print the back pattern piece and check the test square the same way. Fold your fabric and place Center Back on the fold. A 1/2" seam allowance is included at the waist and sides, with a 1" hem allowance. The back is drafted 2" longer than the front for a subtle dipped hem \u2014 cut 1 on the fold.', diagram:'pin'},
      {title:'Sew the side seams', text:'With right sides together, pin the front and back pieces along both side seams and stitch. Finish the raw edges (serge, zigzag, or pinking shears) to prevent fraying.', diagram:'seam'},
      {title:'Finish the waist', text:'Fold and press the waist seam allowance to the inside, then topstitch it down \u2014 or attach a separate waistband here if you\'d like one.', diagram:'attach'},
      {title:'Hem the skirt', text:'Fold and press the hem allowance on both front (1/2") and back (1") \u2014 the back\'s deeper hem is what gives the dipped-back silhouette. Stitch in place all the way around.', diagram:'hem'}
    ]
  },
  {
    id:'pattern-1', name:'Zendaya Spiderman Dress', trend:'', difficulty:'', comingSoon:true,
    time:'', fabric:'', image:'assets/images/17554d3131e604eeb23e9f1c85e2f81b.jpg', emoji:'', yardageBase:0,
    base:{waist:0,hip:0,length:0},
    steps:[
      {title:'Coming soon', text:'Details will be added soon.', diagram:'pin'}
    ]
  }
]
