/**
 * Created by youlongli on 3/20/15.
 */
$(function () {
  var color = [
    'rgb(203,  27,  68)',
    'rgb(250, 214, 137)',
    'rgb(129, 199, 212)',
    'rgb(134, 193, 102)',
    'rgb(139, 129, 195)',
    'rgb(252, 250, 242)',
    'rgb( 12,  12,  12)'
  ];

// Enable the selector
  $('.selectpicker').selectpicker();
  $('.selectpicker').selectpicker('val', 'Shpere'); // Default shape

  /************************Canvas Playground************************/
  var canvasPlayground = initCanvas('playground');
  var parametric = new Parametric(20, 20, uv2xyzSphere);

  $('.selectpicker').on('change', function () {
    var shape = $('.selectpicker').val();
    switch (shape) {
      case 'Shpere':
        parametric.changeShape(uv2xyzSphere);
        break;
      case 'Cylinder':
        parametric.changeShape(uv2xyzCylinder);
        break;
      case 'Ripple':
        parametric.changeShape(uv2xyzRipple);
        break;
      case 'Superquadric':
        parametric.changeShape(uv2xyzSuperquadric);
        break;
      case 'Curving':
        parametric.changeShape(uv2xyzCurving);
        break;
      case 'Spring':
        parametric.changeShape(uv2xyzSpring);
        break;
      case 'Flag':
        parametric.changeShape(uv2xyzFlag);
        break;
      default:
        parametric.changeShape(uv2xyzExperiment);
        break;
    }
  });

  canvasPlayground.update = function (g) {
    var x = this.cursor.x, y = this.cursor.y;

    // Initial the matrix
    var matrix = new Matrix();
    var MatrixAdjustment = {
      scale: parseFloat($("#playground-scale").val()),
      translateX: parseFloat($('#playground-translateX').val()),
      translateY: parseFloat($('#playground-translateY').val()),
      translateZ: parseFloat($('#playground-translateZ').val()),
      rotateX: parseFloat($('#playground-rotateX').val()),
      rotateY: parseFloat($('#playground-rotateY').val()),
      rotateZ: parseFloat($('#playground-rotateZ').val()),
      perspectiveX: parseFloat($('#playground-perspectiveX').val()),
      perspectiveY: parseFloat($('#playground-perspectiveY').val()),
      perspectiveZ: parseFloat($('#playground-perspectiveZ').val()),
      f: parseFloat($('#playground-localLength').val())
    };

    // Update special tuning (May have performance issue)
    parametric.tune($('#playground-tune1').val(), $('#playground-tune2').val(), $('#playground-tune3').val());

    matrix.scale(MatrixAdjustment.scale, MatrixAdjustment.scale, MatrixAdjustment.scale);
    matrix.translate(MatrixAdjustment.translateX, MatrixAdjustment.translateY, MatrixAdjustment.translateZ);
    matrix.rotateX(MatrixAdjustment.rotateX);
    matrix.rotateY(MatrixAdjustment.rotateY);
    matrix.rotateZ(MatrixAdjustment.rotateZ);
    matrix.perspective(MatrixAdjustment.perspectiveX, MatrixAdjustment.perspectiveY, MatrixAdjustment.perspectiveZ);

    //matrix.perspective2(MatrixAdjustment.f);

    parametric.render(this, matrix, g);

    drawBoard(this, g);
  };

  /************************Slider************************/
  $('#playground-scale').noUiSlider({
    start: [0.8],
    step: 0.05,
    range: {
      'min': [0.01],
      'max': [3.00]
    }
  });

  $('#playground-translateX').noUiSlider({
    start: [0],
    step: 0.1,
    range: {
      'min': [-1],
      'max': [1]
    }
  });

  $('#playground-translateY').noUiSlider({
    start: [0],
    step: 0.1,
    range: {
      'min': [-1],
      'max': [1]
    }
  });

  $('#playground-translateZ').noUiSlider({
    start: [0],
    step: 0.1,
    range: {
      'min': [-1],
      'max': [1]
    }
  });

  $('#playground-rotateX').noUiSlider({
    start: [20],
    step: 1,
    range: {
      'min': [0],
      'max': [360]
    }
  });

  $('#playground-rotateY').noUiSlider({
    start: [0],
    step: 1,
    range: {
      'min': [0],
      'max': [360]
    }
  });

  $('#playground-rotateZ').noUiSlider({
    start: [0],
    step: 1,
    range: {
      'min': [0],
      'max': [360]
    }
  });

  $('#playground-perspectiveX').noUiSlider({
    start: [0],
    step: 0.1,
    range: {
      'min': [-1],
      'max': [1]
    }
  });

  $('#playground-perspectiveY').noUiSlider({
    start: [0],
    step: 0.1,
    range: {
      'min': [-1],
      'max': [1]
    }
  });

  $('#playground-perspectiveZ').noUiSlider({
    start: [0],
    step: 0.1,
    range: {
      'min': [-1],
      'max': [1]
    }
  });

  $('#playground-localLength').noUiSlider({
    start: [0],
    step: 0.1,
    range: {
      'min': [-3],
      'max': [3]
    }
  });

  $('#playground-tune1').noUiSlider({
    start: [2],
    step: 0.1,
    range: {
      'min': [0],
      'max': [10]
    }
  });

  $('#playground-tune2').noUiSlider({
    start: [2],
    step: 0.1,
    range: {
      'min': [0],
      'max': [10]
    }
  });

  $('#playground-tune3').noUiSlider({
    start: [2],
    step: 0.1,
    range: {
      'min': [0],
      'max': [10]
    }
  });
});