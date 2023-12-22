import { useEffect, useRef, useState } from 'react';
import './App.css';
import { fabric } from 'fabric';
import { Button, Tooltip, FloatButton, Slider, ColorPicker, Switch } from 'antd';
import { HighlightOutlined, DragOutlined, PlusOutlined, MinusOutlined, FontColorsOutlined } from '@ant-design/icons';

import useFabricZoom from './hooks/canvasZoom';
import useText from './hooks/canvasText';
import useHandleKeyDown from './utils/keymapper';
import { Eraser, Sun, Moon } from './assets';

const getDrawCursor = () => {
  var brushSize = 10;
  var brushColor = "#000000"
  const circle = `
  <svg fill="#000000" height="20" width="20" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 480.001 480.001" xml:space="preserve">
<g>
	<g>
		<path d="M333.142,350.846c0.115-0.115,0.215-0.239,0.323-0.357l129.681-129.706c10.878-10.878,16.864-25.368,16.855-40.8
			c-0.01-15.409-5.999-29.865-16.854-40.694l-97.844-97.874c-10.853-10.845-25.326-16.817-40.75-16.817
			c-15.426,0-29.895,5.974-40.741,16.82L16.855,308.329C5.974,319.21-0.012,333.713,0,349.168
			c0.013,15.425,6.002,29.884,16.854,40.7l62.592,62.606c0.061,0.061,0.127,0.112,0.188,0.171c0.174,0.165,0.349,0.331,0.534,0.483
			c0.082,0.067,0.171,0.126,0.255,0.19c0.175,0.135,0.349,0.271,0.532,0.395c0.07,0.047,0.145,0.085,0.215,0.13
			c0.205,0.131,0.412,0.26,0.627,0.376c0.051,0.026,0.103,0.048,0.154,0.074c0.239,0.123,0.482,0.241,0.732,0.346
			c0.033,0.014,0.067,0.024,0.101,0.037c0.269,0.108,0.54,0.208,0.819,0.293c0.034,0.011,0.07,0.017,0.104,0.027
			c0.276,0.081,0.556,0.154,0.841,0.211c0.082,0.017,0.165,0.023,0.247,0.038c0.239,0.041,0.479,0.084,0.724,0.107
			c0.33,0.033,0.663,0.051,0.998,0.051h137.91h159.308c5.522,0,10-4.478,10-10c0-5.522-4.478-10-10-10H248.566l84.22-84.236
			C332.904,351.06,333.027,350.96,333.142,350.846z M220.285,435.404H90.66l-59.675-59.689
			c-7.076-7.054-10.977-16.487-10.985-26.563c-0.008-10.106,3.897-19.582,10.996-26.681l129.825-129.803l151.091,151.091
			L220.285,435.404z M174.965,178.527L297.953,55.56c7.069-7.069,16.516-10.963,26.6-10.963c10.085,0,19.536,3.895,26.609,10.962
			l97.85,97.88c7.08,7.063,10.982,16.493,10.989,26.557c0.006,10.085-3.899,19.547-10.998,26.645l-122.95,122.974L174.965,178.527z"
			/>
	</g>
</g>
</svg>
`;

  return `data:image/svg+xml;base64,${window.btoa(circle)}`;
};
const getPenCursor = () => {
  var brushSize = 10;
  var brushColor = "#000000"
  const circle = `
  <svg fill="#000000" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22,7.24a1,1,0,0,0-.29-.71L17.47,2.29A1,1,0,0,0,16.76,2a1,1,0,0,0-.71.29L13.22,5.12h0L2.29,16.05a1,1,0,0,0-.29.71V21a1,1,0,0,0,1,1H7.24A1,1,0,0,0,8,21.71L18.87,10.78h0L21.71,8a1.19,1.19,0,0,0,.22-.33,1,1,0,0,0,0-.24.7.7,0,0,0,0-.14ZM6.83,20H4V17.17l9.93-9.93,2.83,2.83ZM18.17,8.66,15.34,5.83l1.42-1.41,2.82,2.82Z"/></svg>
`;

  return `data:image/svg+xml;base64,${window.btoa(circle)}`;
};



const createCanvas = (canvasParentRef) => {
  const initialHeight = canvasParentRef.current.offsetHeight;
  const initialwidth = canvasParentRef.current.offsetWidth;

  const newCanvas = new fabric.Canvas("canvas", {
    height: initialHeight,
    width: initialwidth,
    // perPixelTargetFind: true
  });
  if (typeof newCanvas.historyInit === "function") {
    newCanvas.historyInit();
  }
  return newCanvas;
};

const tools = [
  {
    value: "move",
    icon: <DragOutlined />,
    name: "Move Tool"
  },
  {
    value: "pen",
    icon: <HighlightOutlined />,
    name: "Pen Tool"

  },
  {
    value: "eraser",
    icon: <Eraser width={15} height={14} />,
    name: "Eraser Tool"

  },
  {
    value: "text",
    icon: <FontColorsOutlined />,
    name: "Text Tool"
  }
]

function addGridLines(canvas) {
  if (!canvas) return;

  var gridSize = 40; // Adjust the size of the grid as needed
  var gridLines = [];
  var gridLinesHor = []
  var gridLinesVer = []
  if (canvas.width && canvas.height) {
    const halfWidth = 10000
    const halfHeight = 10000
    const bigger = Math.max(canvas.width, canvas.height) * 2;

    // Add vertical lines
    for (var i = -halfWidth; i < halfWidth; i += gridSize) {
      var line = new fabric.Line([i, -halfHeight, i, halfHeight], {
        stroke: '#828282',
        strokeWidth: 0.5,
        selectable: false,
        hoverCursor: 'default',
        objectCaching: false,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingFlip: true,
        name: "gridLine"
      });
      gridLinesHor.push(line);
    }

    // Add horizontal lines
    for (var j = -halfHeight; j < halfHeight; j += gridSize) {
      var line = new fabric.Line([-halfWidth, j, halfWidth, j], {
        stroke: '#828282',
        strokeWidth: 0.5,
        selectable: false,
        hoverCursor: 'default',
        objectCaching: false,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingFlip: true,
        name: "gridLine"
      });
      gridLinesVer.push(line);
    }
  }


  // Add the grid lines to the canvas
  canvas.add(...gridLinesHor);
  canvas.add(...gridLinesVer);

  canvas.gridLinesHor = gridLinesHor;
  canvas.gridLinesVer = gridLinesVer;

}

function App() {
  const canvasRef = null;
  const canvasParentRef = useRef(null);
  const [currentTool, setCurrentTool] = useState("")
  const [canvas, setCanvas] = useState(null)
  const [isLightMode, setIsLightMode] = useState(true)
  const [brushColor, setBrushColor] = useState("#B27CE6")
  const [brushSize, setBrushSize] = useState(5)
  const [currentZoom, setCurrentZoom] = useState(1)
  const [zoom] = useFabricZoom(canvas, currentTool, currentZoom, setCurrentZoom)
  const [newText, setNewText] = useState(new fabric.Text(
    "Welcome to Drawboard! Start by creating a new sketch or whiteboard", {
    fontSize: 20,
    left: 370,
    top: 120,
    fill:"#000000",
    opacity: 0.5,
    selectable:false
  }))
  const [text] = useText(canvas, currentTool, setCurrentTool);
  const [key] = useHandleKeyDown(
    canvas,
    currentTool,
    currentZoom,
    setCurrentZoom
  );


  const handleSetZoom = (positive) => {
    var newZoom;
    if (positive) newZoom = zoom * 1.2;
    else newZoom = zoom * 0.8;
    if (newZoom > 200) {
      setCurrentZoom(200);
      return;
    }
    if (newZoom < 0.20) {
      setCurrentZoom(0.20);
      return;
    }
    setCurrentZoom(newZoom)
  }



  useEffect(() => {
    function handleFullScreen() {
      if (canvasParentRef.current) {
        canvasParentRef.current.requestFullscreen();
      }
    }
    function handleKeyDown(event) {
      if (event.code === "KeyF") {
        const isInputFocused = document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement;

        if (!isInputFocused) handleFullScreen();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);

    };
  }, []);



  useEffect(() => {
    if (!canvasParentRef) return;
    const canvas = createCanvas(canvasParentRef)
    fabric.Object.prototype.centeredRotation = true;
    fabric.Object.prototype.cornerStrokeColor = "#B27CE6";
    fabric.Object.prototype.cornerSize = 10;
    fabric.Object.prototype.cornerColor = "#ffffff";
    fabric.Object.prototype.dirty = false;
    fabric.Object.prototype.strokeWidth = 20;
    fabric.Object.prototype.borderScaleFactor = 2;
    fabric.Object.prototype.objectCaching = false;
    fabric.Object.prototype.borderColor = "#B27CE6";
    fabric.Object.prototype.controls.mtr.withConnection = false;
    fabric.Object.prototype.controls.mtr.offsetY = -20;
    canvas.add(newText).renderAll()
    setCanvas(canvas)
    addGridLines(canvas)
  }, [canvasParentRef])

  useEffect(() => {
    if (!canvas) return;
    const getDrawCursor = () => {
      const circle = `
      <svg
        height="${brushSize}"
        fill="${brushColor}"
        viewBox="0 0 ${brushSize * 2} ${brushSize * 2}"
        width="${brushSize}"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50%"
          cy="50%"
          r="${brushSize}" 
        />
      </svg>
    `;

      return `data:image/svg+xml;base64,${window.btoa(circle)}`;
    };
    canvas.freeDrawingCursor = `url(${getDrawCursor()}) ${brushSize / 2} ${brushSize / 2}, crosshair`
    canvas.freeDrawingBrush.width = brushSize;
    canvas.freeDrawingBrush.color = brushColor;
  }, [brushSize, brushColor, canvas])


  const changeObjects = (cursor, selectable) => {
    if (!cursor) cursor = "default"
    canvas.defaultCursor = cursor
    canvas.forEachObject(function (obj) {
      if (obj.name != "gridLine") obj.selectable = selectable;
      obj.hoverCursor = cursor
    })
    canvas.renderAll()
  }



  useEffect(() => {
    if (!canvas) return;
    console.log(currentTool)
    if (currentTool == "pen") {
      canvas.isDrawingMode = true;
    }
    else {
      canvas.isDrawingMode = false;
    }


    if (currentTool == "eraser") {
      var size = 20
      canvas.selectable = false;
      changeObjects(`url(${getDrawCursor()}) ${size / 2} ${size / 2}, crosshair`, false)

    }
    else {
      canvas.selectable = true;
      changeObjects(`default`, true)
    }
    if (currentTool == "move") {
      changeObjects('all-scroll', true)
    }
  }, [currentTool])

  useEffect(() => {
    if (!canvas) return;
    const handleObjectMouseDown = (e) => {
      if(newText) {
        canvas.remove(newText).renderAll();
        setNewText(null)
      }
      if (!canvas) return;
      if (currentTool == "eraser") {
        const target = e.target;
        if (target) canvas.remove(target)
        canvas.renderAll()
      }
    }

    const handleMouseOver = (e) => {
      if (currentTool == "eraser") {
        const target = e.target;
        if (target) target.opacity = 0.5;
        canvas.renderAll()
      }
    }

    const handleMouseOut = (e) => {
      if (currentTool == "eraser") {
        const target = e.target;
        if (target) target.opacity = 1;
        canvas.renderAll()
      }

    }

    canvas.on("mouse:down", handleObjectMouseDown);
    canvas.on("mouse:over", handleMouseOver);
    canvas.on("mouse:out", handleMouseOut);


    return () => {
      canvas.off("mouse:down", handleObjectMouseDown);
      canvas.off("mouse:over", handleMouseOver);
      canvas.on("mouse:out", handleMouseOut);

    }
  }, [canvas, currentTool, brushSize, brushColor])




  //121212 for dark
  return (
    <div className="App">
      <div className="canvas-wrapper" style={{ backgroundColor: isLightMode ? "#fcfcfc" : "#121212", height: "100%", width: "100%" }} ref={canvasParentRef}>
        <canvas id="canvas" />
      </div>
      <div className="menu">
        {
          tools?.map((tool) => {
            return (<>
              <Tooltip title={tool.name}>
                <Button type="primary" size='small' shape="round" onClick={() => setCurrentTool(tool.value)} icon={tool.icon}></Button>
              </Tooltip>
            </>)
          })
        }
      </div>

      <div className="dark-mode-toggle">
        <Switch
          checkedChildren={<Sun />}
          unCheckedChildren={<Moon />}
          value={isLightMode}
          onChange={(checked) => setIsLightMode(checked)}
          style={{ boxShadow: "#ffffff 0px 5px 10px" }}
        />
      </div>
      {
        currentTool == "pen" && (
          <div className="pen-menu">
            Stroke Width:<Slider width={"200px"} railBg="#ffffff" min={1} max={20} value={brushSize} onChange={(value) => {
              setBrushSize(Number(value))
            }} />
            Stroke Color <br /> <ColorPicker size="small" showText value={brushColor} onChange={(value, hex) => setBrushColor(hex)} />
          </div>
        )
      }

      <FloatButton.Group shape='square'>
        <FloatButton style={{ boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px" }} onClick={() => handleSetZoom(true)} type='primary' icon={<PlusOutlined />} />
        <FloatButton style={{ boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px" }} type='primary' description={`${zoom.toFixed(2)} `} />
        <FloatButton style={{ boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px" }} onClick={() => handleSetZoom(false)} type='primary' icon={<MinusOutlined />} />
      </FloatButton.Group>
    </div>

  );
}

export default App;
