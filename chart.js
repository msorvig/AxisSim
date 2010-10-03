function createStandardChart(chartDivName, title)
{
    Highcharts.setOptions({
        colors: ['#353F3E', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4']
    });


    var chartDiv = $("#" + chartDivName);
    chartDiv.css("height", "200px");
    chartDiv.css("width", "325px");
    return new Highcharts.Chart({
  chart: {
     renderTo: chartDivName,
     defaultSeriesType: 'column',
     margin: [ 30, 10, 30, 60],
  },
  title: {
     text: title,
     style: {
            font: 'normal 12px Verdana, sans-serif'
     }
  },
  xAxis: {
     categories: [],
     labels: {
        align: 'center',
        style: {
            font: 'normal 8px Verdana, sans-serif'
                }
     }
  },
  yAxis: {
     min: 0,
     title: {
        text: 'Likelihood (%)'
     }
  },
  legend: {
     enabled: false
  },
  tooltip: {
     formatter: function() {
       var unit = "units";
       if (this.x == 1)
           unit = "unit";

       return '<b>'+ this.x + ' ' + unit + ' remaining after battle</b><br/>'+
            'Likelihood: '+ Highcharts.numberFormat(this.y, 1) + "%";
     }
  },
       series: [{
     name: 'Likelihood',
     data: [],
     animation : false,
     dataLabels: {
        enabled: false,
        color: '#FFFFFF',
        y: 10,
        formatter: function() {
           return this.y + "%";
        },
        style: {
           font: 'normal 12px Verdana, sans-serif'
        }
     }
  }]
});

}
