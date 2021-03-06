var circles = document.querySelectorAll('.picFoot p span');
var slide = document.querySelector('.slide');
var imgWidth = parseInt(getComputedStyle(slide.querySelector('span')).width);
// children 是一个非标准的属性
var imgWrap = slide.children[0];
// 解决划过圆点中间时会出现闪一闪的效果
var timer;

/*
圆点切换小图 功能
 */
// slide.offsetWidth: 因为刚开始页面加载的时候，slide是display: none;所以没有获取到宽度；
// 但是实际上是有的
// slide.style.left = (circles[0].offsetLeft - slide.offsetWidth / 2) + 'px';
slide.style.left = (circles[0].offsetLeft - imgWidth / 2) + 'px';
for (var i = 0; i < circles.length; i++) {
    circles[i].index = i;
    circles[i].onmouseover = function(e) {
        // 这里的78 = 156 / 2
        // slide.style.left = (e.layerX - 78) + 'px';
        // slide.style.left = (circles[0].offsetLeft - imgWidth / 2 + 24 * this.index) + 'px';
        clearTimeout(timer);
        slide.style.display = 'block';
        slide.style.left = (this.offsetLeft - imgWidth / 2) + 'px';
        imgWrap.style.left = -imgWidth * this.index + 'px';
    }

    circles[i].onmouseout = function() {
        timer = setTimeout(function() {
            slide.style.display = 'none';
        }, 200);
    }

    circles[i].onclick = function() {
        if (!canClick) return;
        canClick = false;

        cn = this.index;
        if (cn > ln) {
            // next
            showMode.nextImg();
        } else if (cn < ln) {
            // prev
            showMode.prevImg();
        }
    }
}

/*
主图片运动 功能
 */
/*
再点击切换图片时候：
	1. 在图片上面创建了3行8列共24个方块，每个方块都有一张背景图，和下面的图片是一样的;
	2. 前一张后一张点击时候，方块运动形式是不一样的
 */
var next = document.querySelector('.next');
var prev = document.querySelector('.prev');
var imgBox = document.querySelector('.imgBox');
var textArr = ['《天才捕手》定档3.10 科林·费斯调教裘德·洛', '《西游记》的N种可能', '《爱乐之城》 - 北京147家影院上映1122场', '《极限特工：终极回归》 - 北京152家影院上映1623场', '《非凡任务》曝预告海报 黄轩变身硬汉大秀肌肉'];
var text = document.querySelector('.text');

var ln = 0; // last index 上一张图片的索引
var cn = 0; // current index 当前图片的索引
var canClick = true; // 能够进行下一次点击

next.onclick = function() {
    if (!canClick) return;
    canClick = false;
    // ln = cn;
    cn++;
    if (cn === circles.length) {
        cn = 0;
    }
    showMode.nextImg();

};
prev.onclick = function() {
    if (!canClick) return;
    canClick = false;
    // ln = cn;
    cn--;
    if (cn === -1) {
        cn = circles.length - 1;
    }
    showMode.prevImg();
};

var showMode = {
    row: 3,
    col: 8,
    createDom: function() {
        // 用this是为了在这里定义的变量能在其他的方法中用到
        this.w = imgBox.offsetWidth / this.col; // 方块的宽
        this.h = imgBox.offsetHeight / this.row; // 方块的高
        var str = ''; // 生成的方块dom元素
        var img = imgBox.children[0]; // 后面那张图

        // 将要显示的图片替换
        img.src = 'images/' + cn + '.jpg';
        // 飞出去的方块拼接
        for (var i = 0; i < this.row; i++) {
            for (var j = 0; j < this.col; j++) {
                var l = j * this.w; // left
                var t = i * this.h; // top
                // str += '<div style="position: absolute;top: ' + t + 'px;left: ' + l + 'px;width: ' + this.w + 'px;height: ' + this.h + 'px;background-image: url(images/' + cn + '.jpg);background-position:-' + l + 'px ' + '-' + t + 'px;"></div>'
                str += '<div style="position: absolute;top: ' + t + 'px;left: ' + l + 'px;width: ' + this.w + 'px;height: ' + this.h + 'px;background: url(images/' + ln + '.jpg) -' + l + 'px -' + t + 'px;" data-addnum=' + (i + j) + ' data-cutnum=' + (j - i) + '></div>'
            }
        }
        imgBox.innerHTML += str;

        /*
        需要重新排序，实现斜线式的运动（一条斜线上的i+j之和是一样的）
        divs是一个伪数组，没有sort方法来排序
         */
        // var divs = document.querySelectorAll('.imgBox div');
        var divs = imgBox.getElementsByTagName('div');
        this.newDivs = Array.prototype.slice.call(divs); // 转换成数组
    },
    // 移动圆点、div方块、文字
    move: function() {
        // 圆点
        circles[ln].className = '';
        circles[cn].className = 'active';
        text.style.bottom = '-40px';
        // div方块
        var _this = this;
        for (var i = 0; i < this.newDivs.length; i++) {
            // 有动画效果
            // this.divs[i].style.left = this.divs[i].offsetLeft - this.w + 'px';
            // this.divs[i].style.top = this.divs[i].offsetTop - this.h + 'px';

            // 没有动画效果，所以加一个自执行函数
            (function(i) {
                setTimeout(function() {
                    _this.newDivs[i].style.transform = 'translate(-' + _this.w + 'px, -' + _this.h + 'px)';
                    _this.newDivs[i].style.opacity = 0;
                }, i * 40)
            // i * 40 小方块延迟各自运动
            })(i)
        }

        var n = 0;
        this.newDivs[this.newDivs.length - 1].addEventListener('transitionend', function() {
            n++;
            if (n === 1) {
                imgBox.innerHTML = '<img src="images/' + cn + '.jpg" alt="" />'
                canClick = true;
                text.style.bottom = '0px';
                // 文字
                text.innerHTML = textArr[cn];
                ln = cn;
            }
        });
    },
    nextImg: function() {
        this.createDom();
        this.newDivs.sort(function(a, b) {
            // return a.getAttribute('data-addnum') - b.getAttribute('data-addnum');
            return a.dataset.addnum - b.dataset.addnum;
        });
        this.move();
    },
    prevImg: function() {
        this.createDom();
        this.newDivs.sort(function(a, b) {
            return b.dataset.cutnum - a.dataset.cutnum;
        });
        this.move();
    }
};