import { Component, OnInit, AfterViewInit, ViewChild, HostListener, ChangeDetectorRef,  } from '@angular/core';
import { CoreService } from '../core.service';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import  { ViewDetailsComponent } from './view-details/view-details.component'
import { SimpleInputComponent } from './simple-input/simple-input.component';
import { Subject } from 'rxjs';
import * as FileSaver from 'file-saver';
import * as htmlDocx from 'html-docx-js/dist/html-docx.js';
import * as domtoimage from 'dom-to-image/dist/dom-to-image.min.js';
import * as _ from 'lodash';
@Component({
  selector: 'app-view-insights',
  templateUrl: './view-insights.component.html',
  styleUrls: ['./view-insights.component.less']
})
export class ViewInsightsComponent implements OnInit, AfterViewInit {

  @ViewChild('storyBoard') storyBoard;
  insights = [];
  filteredInsights = []
  filteredTags = [];
  insightAttributes = ['book','chapter','verses','rating','insight','tags'];
  tags = [];
  searchText = '';
  selectedTag = '';
  showDropDown = false;
  SBInsights = [];
  droppedOutside = true;
  storyBoardRows = [];
  storyBoardInsights = []
  dottedLineWidth = 50;
  storyInsightWidth = 200;
  storyInsightsPerRow = 4;
  insertingRow = -1;
  insertingColumn = -1;
  debounce = new Subject();
  draggingInsight:any = false;
  dragCopy;
  fromBank = false;
  previousNext;
  showStoryBoard = true;
  delayShowStoryBoard = true;
  isViewInsights = true;
  storyboards = [];
  filteredStoryboards = [];
  selectedStoryboard:any = {type:'storyboard'};
  startingConnection:any = false;
  spiderLines:any = [];
  tempId = 0;
  panelHeight = 110;
  panelWidth = 210;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // this.ngAfterViewInit();
  }

  constructor(private coreService: CoreService, private router: Router, private dialog:MatDialog, private cd:ChangeDetectorRef) { }

  ngOnInit() {
    //get all insights for user
    this.coreService.getInsights().subscribe((insights:any) =>{
        //remove any cross site scripting and form display name for each insight
        insights.forEach(insight => {
          insight.insight.replace('script','')
          insight.display = `${insight.book} ${insight.chapter}:${insight.verses}`
        });
        this.SBInsights = this.filteredInsights = this.insights = insights;
    });

    //get all tags made by a current user
    this.coreService.getTags().subscribe((tags:any) => this.filteredTags = this.tags = ['All',...tags]);

    this.coreService.getStoryBoards().subscribe((storyboards:any)=> this.filteredStoryboards = this.storyboards = storyboards.map(storyboard => storyboard.insights.map(insight => insight.display = `${insight.book} ${insight.chapter}:${insight.verses}`)));
    this.coreService.getSpiderBoards().subscribe((spiderboards:any)=>{
      console.log(spiderboards)
    })

    //this handles when dragover and where to show hover state of insight
    this.debounce.throttleTime(300).filter((next)=> {
      this.previousNext = next[0];
      return this.selectedStoryboard.type === 'storyboard' && this.previousNext === next[0] && this.previousNext === 'notOverInsight';
    }).subscribe((values:[string,object,object])=>{
      //this calls notOverInsight or insertDraggingInsight
      this[values[0]](...values.slice(1));
    });
  }

  ngAfterViewInit() {
    const padding = 30;
    //based on screen size sets how many insights per row
    // this.storyInsightsPerRow = Math.floor(this.storyBoard.nativeElement.clientWidth / (this.storyInsightWidth + this.dottedLineWidth + padding));
    // setTimeout(()=>this.setRows());
  }
  viewInsight(insight){
    return this.dialog.open(ViewDetailsComponent,{data:insight}).afterClosed()
  }


  filter(){
    this.isViewInsights ? this.filteredInsights = this.insights.filter(insight => this.isInSearch(insight)) :
    this.filteredStoryboards = this.storyboards.filter(sb =>  sb.storyboardName.toString().includes(this.searchText) || sb.insights.some(i => _.values(i).some(value => (value && value.toString().includes(this.searchText)))))
  }

  isInSearch(insight) {
    return _.values(insight).slice(1,-1).some(value => (value && value.toString().includes(this.searchText) || insight.tags.some(tag => tag.includes(this.searchText))))
    && (insight.tags.some(tag => tag.toLowerCase().includes(this.selectedTag.toLowerCase())) || this.selectedTag === 'All');
  }

  selectTag(){
    this.filteredTags = this.tags.filter(tag => tag.toLowerCase().includes(this.selectedTag.toLowerCase()));
    this.showDropDown = false;
    this.filter();
  }

  updateInsight(insight){
    this.coreService.selectedInsight = insight;
    this.router.navigate(['create']);
  }

  loadStoryBoard(storyboard){
    this.storyBoardInsights = storyboard.insights;
    this.selectedStoryboard = storyboard;
    this.setRows();
    this.goStoryBoard();
  }

  dragEndHolder(insight){
    this.droppedOutside ? this.SBInsights.splice(this.SBInsights.indexOf(insight),1) : this.droppedOutside = true;
  }

  dropHolder(insight, index?){
    this.droppedOutside = false;
    const isInSB = this.SBInsights.indexOf(insight);
    isInSB > -1 && this.SBInsights.splice(isInSB,1);
    index > -1 ? this.SBInsights.splice(index,0,insight) : this.SBInsights.push(insight)
  }

  //////////////////////////////////
  ///Download button functions
  /////////////////////////////////
  wordDownload(){
    this.openSimpleInput((title) => {
      FileSaver.saveAs(htmlDocx.asBlob(this.storyBoardInsights.reduce((accumlator, insight) => {
        if(insight.insightId) {
          return `${accumlator}<h3>${insight.display}</h3><h4>Scripture:</h4><p>${(this.coreService.getScriptures(insight.book,insight.chapter,insight.verses)[0] || []).join('</p><p>')}</p><h4>Insight:</h4><p>${insight.insight}</p><br><br>`;
        } else {
          return `${accumlator}<h4>Connection Thought:</h4><p>${insight.connection}</p><br><br>`
        }
      }, `<!DOCTYPE html><html><head></head><body>`) +  `</body></html>`), `${title}.docx`);
    });
  }

  openSimpleInput(callback) {
    this.dialog.open(SimpleInputComponent,{
      data:this.selectedStoryboard.storyboardName || '',
      width:'500px'
    }).afterClosed().subscribe((title) =>  title && callback(title));
  }

  imageDownload() {
    this.openSimpleInput((title) =>{
      this.storyBoard.nativeElement.querySelectorAll('.add-connector').forEach(connector => connector.parentNode.removeChild(connector));
      this.storyBoard.nativeElement.style.overflow = 'hidden';
      domtoimage.toBlob(this.storyBoard.nativeElement, { quality: 0.95, height: 2000, width:1500})
      .then((blob) => {
        FileSaver.saveAs(blob,title);
        this.setRows();
      });
    });
  }

  /////////////////////////////
  ///start storyboard code
  /////////////////////////////
  goStoryBoard(){
    this.showStoryBoard = true;
    setTimeout(()=>this.delayShowStoryBoard = true,2000)
  }

  storyBoardPlace(){
    this.storyBoardInsights.indexOf(this.dragCopy) === -1 ? this.storyBoardInsights.push(this.dragCopy) : this.storyBoardInsights.splice(this.storyBoardInsights.indexOf(this.dragCopy), 1)
    this.fromBank = this.dragCopy = this.draggingInsight = false;
    this.setRows();
  }

  setRows() {
    this.storyBoardRows = [];
    for(let rowNumber = 0; rowNumber < this.storyBoardInsights.length/this.storyInsightsPerRow; rowNumber++) {
      //forms and array of rows that holds an array of insights for that row
      this.storyBoardRows.push(this.storyBoardInsights.slice(rowNumber*this.storyInsightsPerRow,rowNumber*this.storyInsightsPerRow + this.storyInsightsPerRow))
    }

    //tells angular to run change detection
    this.cd.detectChanges();
    this.cd.markForCheck();
  }

  insertDraggingInsight(dropInsight, dragInsight) {
    const storyBoardInsightsIndex = this.storyBoardInsights.indexOf(dragInsight);
    const storyBoardReplaceIndex = this.storyBoardInsights.indexOf(dropInsight);
    this.draggingInsight = this.dragCopy;
    this.storyBoardInsights.splice(storyBoardReplaceIndex + 1,0,dragInsight);
    storyBoardInsightsIndex !== -1 && this.storyBoardInsights.splice(storyBoardInsightsIndex  + +(storyBoardInsightsIndex > storyBoardReplaceIndex),1);
    this.fromBank = false;
    this.setRows();
  }

  addConnector(insight) {
    this.storyBoardInsights.splice(this.storyBoardInsights.indexOf(insight) + 1,0,{});
    this.setRows();
  }

  notOverInsight() {
    if(this.draggingInsight && !this.fromBank) {
      this.storyBoardInsights.splice(this.storyBoardInsights.indexOf(this.draggingInsight),1);
      this.draggingInsight = false;
      this.setRows();
    }
  }

  saveStoryBoard() {
    this.openSimpleInput((title) => this.coreService['upsert' + ( this.selectedStoryboard.type === 'spider' ? 'SpiderBoard': 'StoryBoard')]({
      storyboardName:title,
      storyboardId:this.selectedStoryboard.storyboardId || this.selectedStoryboard.spiderboardId,
      insights:this.storyBoardInsights
    }));
  }

  deleteStoryBoard() {
    this.coreService.deleteStoryBoard(this.selectedStoryboard);
    this.delayShowStoryBoard = this.showStoryBoard = false;
  }

  setBoard(type: 'spider' | 'storyboard'){
    (this.selectedStoryboard.type = type) === 'storyboard' ? this.setRows() : this.setSpiderboard();
  }
  //////////////////////////////////
  //start spider board code
  /////////////////////////////////
  setSpiderboard() {

    this.storyBoardInsights.forEach((insight, index) =>{
      console.log(insight, index)
      if(!insight.x){
        Object.assign(insight,{x:(index % this.storyInsightsPerRow) * (this.panelWidth + 20) + 20, y:Math.floor(index/this.storyInsightsPerRow)+ 20});
        if(!insight.insightId) {
          insight.insightId = --this.tempId
        }
      }
      if(index){
        this.setSpiderLine(this.storyBoardInsights[index-1],insight);
      }
    });
    this.spiderLines = this.spiderLines.map((line) => this.setSpiderLine(line.startingInsight, line.endingInsight));
    this.draggingInsight =true;
  }
  placeSpiderInsight(drop, insight){
    const parentElement = (drop.srcElement.closest('.line-container') || drop.srcElement.closest('.panel') || drop.srcElement.closest('.connector')|| {style:{top:'0px',left:'0px'}}).style;
    Object.assign(this.draggingInsight,{x:drop.offsetX + +parentElement.left.slice(0,-2) - 105,y:drop.offsetY + +parentElement.top.slice(0,-2)  - 55});
    !this.storyBoardInsights.find(i => i === this.draggingInsight) && this.storyBoardInsights.push(Object.assign(this.draggingInsight,{connections:[]}));
    this.spiderLines = this.spiderLines.map((line) => this.setSpiderLine(line.startingInsight, line.endingInsight));
    this.dragCopy = this.draggingInsight = false;
  }

  setSpiderLine(startingInsight, endingInsight) {
    const height = startingInsight.y - endingInsight.y;
    const width = startingInsight.x - endingInsight.x;
    const direction = (width > 0 && height > 0) || (width < 0 && height < 0) ? {
      x1:0,
      x2:Math.abs(width),
      y1:0,
      y2:Math.abs(height)
    } : {
      x1:0,
      x2:Math.abs(width),
      y1:Math.abs(height),
      y2:0
    };
    return Object.assign({
      //height and width of svg holding the line
      width:Math.abs(width),
      height:Math.abs(height),
      //postion of svg
      top: (height > 0 ? endingInsight : startingInsight).y + this.panelHeight/2,
      left:(width > 0 ? endingInsight : startingInsight).x + this.panelWidth/2,
      //reference to insights line is connecting
      endingInsight:endingInsight,
      startingInsight:startingInsight
      //direction of the line that is drawn
    },direction)
  }

  addSpiderConnector(line) {
    const connector = {x:line.left + (line.width/2) - this.panelWidth/2 ,y:line.top + (line.height/2)-this.panelHeight/2, insightId:--this.tempId};
    this.spiderLines.splice(this.spiderLines.indexOf(line),1,this.setSpiderLine(line.startingInsight,connector),this.setSpiderLine(line.endingInsight,connector));
    this.storyBoardInsights.push(connector);
  }

  expandCluster(insight) {
    if(this.startingConnection === insight) {
      this.viewInsight(insight).subscribe(()=> this.startingConnection = false);
    } else if(this.startingConnection){
      //make add line between startingConnection and insight
      this.spiderLines.push(this.setSpiderLine(this.startingConnection,insight));
      this.startingConnection = false;
    } else {
      this.startingConnection = insight;
    }
  }
}
