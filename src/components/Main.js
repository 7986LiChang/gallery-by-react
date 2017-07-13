require('normalize.css/normalize.css');
require('styles/App.scss');



import React from 'react';
import ReactDOM from 'react-dom';
import {findDOMNode} from 'react-dom';


let yeomanImage = require('../images/yeoman.png');

//获取图片相关的数据
let imageDatas = require('../data/imageDatas.json');

//利用自执行函数，将图片名信息转换成图片URL路径信息
imageDatas = (function genImageURL(imageDatasArr){
	for(var i = 0; i < imageDatasArr.length; i++){
		var singleImageData =  imageDatasArr[i];

		singleImageData.imageURL = require('../images/' + singleImageData.fileName);
		imageDatasArr[i] = singleImageData;
	}

	return imageDatasArr;
})(imageDatas);


/*
 * 获取区间内的随机值
 */
function getRangeRandom(low, high){
	return Math.ceil(Math.random() * (high - low) + low); 
}


class ImageFirgure extends React.Component {

	render() {

		let styleObj = {};

		if(this.props.arrange.pos){
			styleObj = this.props.arrange.pos;
		}
		return (
			<figure className="img-figure" style={styleObj}>
				<img src={this.props.data.imageURL} alt={this.props.data.title}/>
				<figcaption className="img-title">
					<p>{this.props.data.title}</p>
				</figcaption>
			</figure>
			);
	}
}

// ImageFirgure.defaultProps = {
// };


class AppComponent extends React.Component {
	//生命state,在constructor中,imgsArrangeArr存储所有图片位置状态
	constructor(props) {
		
		super(props);
		//图片组件位置范围，只在左右侧，上侧
		this.Constant = {
			//中心位置取值
			centerPos: {
				left: 0,
				right: 0,
			},
			//水平方向取值范围
			hPosRange: {
				leftSecX: [0, 0],
				rightSecX: [0, 0],
				y: [0, 0],
			},
			//垂直方向取值范围
			vPosRange: {
				x: [0, 0],
				topY: [0, 0],
			},
		};
		this.state = {
			imgsArrangeArr: [
				/*{
					pos：{
						left: '0',
						right: '0'
					}
				}*/
			]
		};
	}

	/*
	 *  重新布局图片
	 *  @param centerIndex指定居中哪个图片	
	 */
	rearrange(centerIndex) {
		let imgsArrangeArr = this.state.imgsArrangeArr,
			Constant = this.Constant,
			centerPos = Constant.centerPos,
			hPosRange = Constant.hPosRange,
			vPosRange = Constant.vPosRange,
			hposRangeLeftSecX = hPosRange.leftSecX,
			hPosRangeRightSecX = hPosRange.rightSecX,
			hPosRangeY = hPosRange.y,
			vPosRangeX = vPosRange.x,
			vPosRangeTopY = vPosRange.topY,

			//存储布局在上侧区域的图片
			imgsArrangeTopArr = [],
			//取1个/0个位于上侧区域
			topImgNum = Math.ceil(Math.random() * 2),
			//布局在上侧区域的图片标识
			topImgSpliceIndex = 0,

			//取出居中位置的图片状态，imgsArrangeArr
			imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);
			//1、首先居中 centerIndex 的图片
			imgsArrangeCenterArr[0].pos = centerPos;

			//2、取出要布局上侧的图片的状态信息
			topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));
			imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgSpliceIndex)
			//布局位于上侧的图片
			imgsArrangeTopArr.forEach( function (value, index) {
				imgsArrangeTopArr[index].pos = {
					left: getRangeRandom(vPosRangeX[0], vPosRangeX[1]),
					top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1])
				}
			});

			//3、布局左右两侧的图片
			for(var i = 0, j = imgsArrangeArr.length, k = j / 2;i < j; i++){
				//左区域或右区域的x取值范围
				let hPosRangeLORx = null;
				//前半部分布局左侧，后半部分布局右侧
				if(i < k){
					hPosRangeLORx = hposRangeLeftSecX;
				}
				else
				{
					hPosRangeLORx = hPosRangeRightSecX;
				}

				imgsArrangeArr[i].pos = {
					left: getRangeRandom(hPosRangeLORx[0], hPosRangeLORx[1]),
					top: getRangeRandom(hPosRangeY[0], hPosRangeY[1])
				};
			}

			//将取出的填充上侧区域的图片状态信息放回
			if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
				imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
			}

			//中心图片位置信息放回
			imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);

			//设置state值为imgsArrangeArr
			this.setState({
				imgsArrangeArr: imgsArrangeArr
			});

	}

	
	//组件加载后，为每张照片计算位置范围。
	//只会在装载完成后调用一次，在render之后调用
	componentDidMount() {
		//首先拿到舞台大小
		let stageDOM = ReactDOM.findDOMNode(this.refs.stage),
			stageW = stageDOM.scrollWidth,
			stageH = stageDOM.scrollHeight,
			halfStageW = Math.ceil(stageW / 2),
			halfStageH = Math.ceil(stageH / 2);

		//拿到一个imageFigure的大小
		let imgFirgureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
			imgW = imgFirgureDOM.scrollWidth,
			imgH = imgFirgureDOM.scrollHeight,
			halfimgW = Math.ceil(imgW / 2),
			halfimgH = Math.ceil(imgH / 2);

		//计算中心图片的位置点
		this.Constant.centerPos = {
			left: halfStageW - halfimgW,
			top: halfStageH - halfimgH
		};

		//计算左侧，右侧区域图片位置的取值范围
		this.Constant.hPosRange.leftSecX[0] = -halfimgW;
		this.Constant.hPosRange.leftSecX[1] = halfStageW - halfimgW * 3;
		this.Constant.hPosRange.rightSecX[0] = halfStageW + halfimgW;
		this.Constant.hPosRange.rightSecX[1] = stageW - halfimgW;
		this.Constant.hPosRange.y[0] = -halfimgH;
		this.Constant.hPosRange.y[1] = stageH - halfimgH;

		//计算上侧区域图片位置的取值范围
		this.Constant.vPosRange.x[0] = halfStageW - imgW;
		this.Constant.vPosRange.x[1] = halfStageW;
		this.Constant.vPosRange.topY[0] = -halfimgH;
		this.Constant.vPosRange.topY[1] = halfStageH - halfimgH * 3;		

		//布局所有图片,指定居中图片index
		this.rearrange(5);
	}

  render() {

	let controllerUnits = [],
		imgFigures = [];

	imageDatas.forEach( function(value, index){

		//若没有位置，则为其初始化为0
		if(!this.state.imgsArrangeArr[index]){
			this.state.imgsArrangeArr[index] = {
				pos: {
					left: 0,
					right: 0
				}
			};
		}
		//否则为其随机位置
		imgFigures.push(<ImageFirgure data = {value} ref={'imgFigure' + index} arrange={this.state.imgsArrangeArr[index]}/>);
	}.bind(this));

    return (
      <section className="stage" ref="stage">
      	<section className="img-sec">
      		{imgFigures}
      	</section>	
      	<nav className="controller-nav">
      		{controllerUnits}
      	</nav>
      </section>		
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
