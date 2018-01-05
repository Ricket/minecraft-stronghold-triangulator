// This is a module which plots Minecraft Stronghold locations 
// using the parameters of a thrown Eye of Ender

/*
    Copyright (C) 2013 Robert Forsman <github@thoth.purplefrog.com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

function Map(elt, cw, ch)
{
    this.fromInputs = fromInputs;
    this.worldToScreen = worldToScreen;
    this.screenToWorld = screenToWorld;
    this.annulus = annulus;
    this.gridify = gridify;
    this.drawVector = drawVector;
    this.replot = replot;
    this.plotRow = plotRow;

    //

    this.paper_width = cw;
    this.paper_height = ch;
    this.lines = [];

    this.length = 1200; // how long are the lines we draw?
    paper;
    this.screen_origin = [ cw/2, ch/2 ]
    this.scale = Math.min(cw, ch) / 5000
    this.world_min = [ -this.screen_origin[0] / this.scale , -this.screen_origin[1] / this.scale ]
    this.world_max = [ (this.paper_width-this.screen_origin[0]) / this.scale , (this.paper_height-this.screen_origin[1]) / this.scale ]

    this.grid_spacing = 100; //real world coordinates


    this.paper = Raphael(elt,cw,ch);
    var bg = this.paper.rect(0,0,cw,ch);
    bg.attr("fill", "#ffc");

    this.annulus();
    this.gridify();

    if (0) {
	this.drawVector(-413, 12, 88.88)
	this.drawVector(-427, 249, 108.687)
	this.drawVector(-546, 292, 116.48)
	this.drawVector(-923, 274, 150.38)
    }

//
//
//

    function fromInputs(){
	var x = parseFloat($("#x")[0].value);
	var z = parseFloat($("#z")[0].value);
	var theta = parseFloat($("#theta")[0].value);
	this.drawVector(x,z,theta);
    }

    function replot() {
	for (var i=0; i<this.lines.length; i++) {
	    this.lines[i].remove();
	}
	this.lines = [];
	
	var raw = $("#data")[0].value;
	var lines = raw.split("\n");
	console.log(lines.length);
	var map = this;
	lines.map( function(row) { map.plotRow(row); } );
    }

    function plotRow(row)
    {
	row = row.trim();
	//console.log(row);
	var cols = row.split(/\s+/);
	if (row.length==0) {
	    return;
	}
	if (cols.length != 3) {
	    alert("confusing data line '"+row+"', should be  'x z theta'");
	    return;
	}
	var x = parseFloat(cols[0]);
	var z = parseFloat(cols[1]);
	var theta = parseFloat(cols[2]);
	//console.log("x="+x+"; z="+z+"; theta="+theta);

	this.drawVector(x,z,theta);
    }

    function drawVector(x,z,theta)
    {
	var to_x = x - this.length * Math.sin((Math.PI*theta)/180);  
	var to_z =  z + this.length * Math.cos((Math.PI*theta)/180);
	var path_string = "M" + x +" "+ z + " L" + to_x + " " + to_z;
	//var path_string = "M 0 0 L 100 100";
	line = this.paper.path(path_string);
	this.worldToScreen(line);
	console.log(path_string);

	this.lines.push(line);

	var radius=10
	var anchor_string = "M "+(x-radius)+" "+z+" L"+
	    x+" "+(z-radius)+" "+
	    (x+radius)+" "+z+" "+
	    x+" "+(z+radius)+" "
	var blork = this.paper.path(anchor_string);
	this.worldToScreen(blork)
	blork.attr("stroke", "none")
	blork.attr("fill", "#0000ff")

	this.lines.push(blork);
    }


    function worldToScreen1(line){
	line.scale(this.scale, this.scale, 0, 0);
	line.transform("t" + this.paper_height * this.scale + "," + this.paper_height * scale);			
    }

    function worldToScreen(line)
    {
	line.transform(['m', this.scale, 0, 0, this.scale, 
			this.screen_origin[0], this.screen_origin[1]
		       ]
		      );
    }


    function screenToWorld(x,y)
    {
	return [
	    (x-this.screen_origin[0])/this.scale,
	    (y-this.screen_origin[1])/this.scale
	] ;
    }

    function annulus()
    {
	var r1 = 640;
	var r2 = 1152;

	a = this.paper.path("M "+r1+",0"
			    +" A "+r1+","+r1+" 0 0 0 "+(-r1)+",0"
			    +" A "+r1+","+r1+" 0 0 0 "+r1+",0"
			    +" z"
			    +"M "+(-r2)+",0"
			    +" A "+r2+","+r2+" 0 0 1 "+r2+",0"
			    +" A "+r2+","+r2+" 0 0 1 "+(-r2)+",0"
			    +" z"
			   )
	a.attr('stroke', 'none')
	a.attr('fill', '#cfc')
	a.attr('fill-rule', 'evenodd')
	this.worldToScreen(a);
    }

    function gridify(){

	//r=1000;
	var j0 = Math.ceil( (this.world_min[0]) / this.grid_spacing);
	var j1 = Math.floor( (this.world_max[0]) / this.grid_spacing);

	var font_size=36;

	console.log("gridify x ["+j0+" .. "+j1+"]");

	for(var x_pos = j0*this.grid_spacing; x_pos <=j1*this.grid_spacing; x_pos +=this.grid_spacing){
	    var line = this.paper.path("M "+x_pos+" "+this.world_min[1]+" L "+x_pos+" "+this.world_max[1]);
	    if (x_pos==0)
		line.attr("stroke", "#f00");
	    this.worldToScreen(line);

	    var text = this.paper.text(x_pos, 0, ""+x_pos)
	    text.attr("font-size", font_size);
	    this.worldToScreen(text);
	}

	//horizontal stripes

	var j0 = Math.ceil( this.world_min[1] / this.grid_spacing)
	var j1 = Math.floor( this.world_max[1] / this.grid_spacing)

	for(var y_pos = j0*this.grid_spacing; y_pos <=j1*this.grid_spacing; y_pos +=this.grid_spacing){
	    var line = this.paper.path("M "+this.world_min[0]+" "+y_pos+" L "+this.world_max[0]+" "+y_pos);
	    if (y_pos==0) 
		line.attr("stroke", "#f00");
	    else {
		var text = this.paper.text(0, y_pos, ""+y_pos)
		text.attr("font-size", font_size);
		this.worldToScreen(text);
	    }

	    this.worldToScreen(line);
	}
    }


}

//
//
//

window.onload = function(){

    map = new Map(document.getElementById('paper'), 1200, 1200);

    map.replot();
}
