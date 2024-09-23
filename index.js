const animateMotionTemplate = `
    <animateMotion
      fill="freeze"
      calcMode="linear"
      dur="1000ms"
      keyPoints="{{pointStart}};{{pointEnd}}"
      keyTimes="0;1"
      begin="{{begin}}"
      id="{{animateId}}"
    >
      <mpath href="#{{pathId}}" />
    </animateMotion>
`;

const bounceTemplate = `
    <circle id="procentBounce" r="10" fill="red">
      {{animateMotion}}
    </circle>
`;

class Bounce {

    bounceId='procentBounce';
    pathId='bouncePath';
    svgContainer = null;
    animateLastId = null;
    lastPercent = 0;

    getUniqId () {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    renderBounce (svgId, startPercent = 0) {
        this.lastPercent = startPercent;
        this.svgContainer = document.getElementById(svgId);
        const rect = this.svgContainer.querySelector('rect');
        const path = this.convertPrimitive(rect);
        path.setAttribute('id', this.pathId);
        this.svgContainer.prepend(path);
        const bounce = this.createBounceTemplate(startPercent)
        this.svgContainer.insertAdjacentHTML("beforeend", bounce);
    }

    convertPrimitive(primitive) {
        const pathData = primitive.getPathData({normalize:true});
        const attributes = [...primitive.attributes];
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const exclude = ['x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'points', 'height',
          'width', 'stroke', 'id'
        ];
  
        this.setAttributes(path, attributes, exclude);
        path.setPathData(this.roundPathData(pathData, 1));
        return path;
    }
    
    roundPathData(pathData, decimals = 3) {
      pathData.forEach(function(com, c) {
        let values = com['values'];
        values.forEach(function(val, v) {
          pathData[c]['values'][v] = +val.toFixed(decimals);
        })
      })
      return pathData;
    }
    
    setAttributes(el, attributes, exclude = []) {
      attributes.forEach(function(att, a) {
        if (exclude.indexOf(att.nodeName) === -1) {
          el.setAttribute(att.nodeName, att.nodeValue)
        }
      })
    }

    createBounceTemplate (startPercent) {
        const animationId = this.getUniqId();
        const animation = this.createAnimateTemplate(animationId, startPercent, startPercent, '0s');
        this.animateLastId = animationId;
        return bounceTemplate.replace('{{animateMotion}}', animation);
    }
    createAnimateTemplate (id, pointStart, pointEnd, begin) {
        let animateTemplate = animateMotionTemplate;
        animateTemplate = animateTemplate.replace('{{pathId}}', this.pathId);
        animateTemplate = animateTemplate.replace('{{pointStart}}', pointStart);
        animateTemplate = animateTemplate.replace('{{pointEnd}}', pointEnd);
        animateTemplate = animateTemplate.replace('{{begin}}', begin);
        animateTemplate = animateTemplate.replace('{{animateId}}', id);
        return animateTemplate;
    }

    animateBounce (percent) {
        const begin = `${this.animateLastId}.end`;
        const start = this.lastPercent;
        const end = percent;
        const animateId = this.getUniqId();
        const animation = this.createAnimateTemplate(animateId, start, end, begin)
        const bounce = this.svgContainer.getElementById(this.bounceId);
        if (bounce) {
            bounce.insertAdjacentHTML("beforeend", animation);
            this.lastPercent = percent;
            this.animateLastId = animateId;
        }
    }

    deleteBounce () {
        const bounce = this.svgContainer.getElementById(this.bounceId);
        bounce.setAttribute('fill', 'green')
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const bounce = new Bounce();
    bounce.renderBounce('bounceSvg', 0);
    let count = 0;
    let randomPercent = 0
    const setIntervalBounce = setInterval(() => {
        console.log('Interval')
        randomPercent = Math.floor(Math.random() * 100) + 1;
        if (count === 5) randomPercent = 100
        bounce.animateBounce(randomPercent / 100)
        if (randomPercent === 100) {
            reset();
        }
        count += 1;
    }, 900);

    function reset () {
        clearInterval(setIntervalBounce)
        setTimeout(() => {
            bounce.deleteBounce();
        }, 1000)
    }
})