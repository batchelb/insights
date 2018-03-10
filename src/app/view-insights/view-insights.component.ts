import { Component, OnInit, AfterViewInit, ViewChild, HostListener, ChangeDetectorRef,  } from '@angular/core';
import { CoreService } from '../core.service';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
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

  insights = [];
  @ViewChild('storyBoard') storyBoard;
  filteredInsights = []
  filteredTags = [];
  insightAttributes = ['book','chapter','verses','rating','insight','tags'];
  attributes = this.insightAttributes;
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
  draggingInsight = false;
  dragCopy;
  fromBank = false;
  previousNext;
  showStoryBoard = true;
  delayShowStoryBoard = true;
  isViewInsights = true;
  storyboards = [];
  filteredStoryboards = [];
  selectedStoryboard:any = {type:'spider'};
  startingConnection:any = false;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.ngAfterViewInit();
  }

  constructor(private coreService: CoreService, private router: Router, private dialog:MatDialog, private cd:ChangeDetectorRef) { }

  ngOnInit() {
    this.coreService.getInsights().subscribe((insights:any) =>{
      if(insights.constructor === Array) {
        insights.forEach(insight => {
          insight.insight.replace('script','')
          insight.display = `${insight.book} ${insight.chapter}:${insight.verses}`
        });
        this.SBInsights = this.filteredInsights = this.insights = insights;
      }
    });
    this.coreService.getTags().subscribe((tags:any) =>{
      this.tags = ['All',...tags];
      this.filteredTags = this.tags;
    });
    this.coreService.getStoryBoards().subscribe((storyboards:any)=>{
      storyboards.forEach(storyboard => storyboard.insights.forEach(insight => insight.display = `${insight.book} ${insight.chapter}:${insight.verses}`))
      this.filteredStoryboards = this.storyboards = storyboards;
    });
    this.debounce.throttleTime(300).filter((next)=> {
      const filter = this.previousNext !== next[0] && this.previousNext !== 'notOverInsight'
      this.previousNext = next[0];
      return !filter;
    }).subscribe((values:any)=>{
      values && this[values[0]](...values.slice(1));
    });
  }

  ngAfterViewInit() {
    const padding = 30;
    this.storyInsightsPerRow = Math.floor(this.storyBoard.nativeElement.clientWidth / (this.storyInsightWidth + this.dottedLineWidth + padding));
    setTimeout(()=>this.setRows());
  }
  setRows() {
    this.storyBoardRows = [];
    for(let i = 0; i < this.storyBoardInsights.length/this.storyInsightsPerRow; i++) {
      this.storyBoardRows.push(this.storyBoardInsights.slice(i*this.storyInsightsPerRow,i*this.storyInsightsPerRow + this.storyInsightsPerRow))
    }
    this.cd.detectChanges();
    this.cd.markForCheck();
  }
  loadStoryBoard(storyboard){
    this.storyBoardInsights = storyboard.insights;
    this.selectedStoryboard = storyboard;
    this.setRows();
    this.goStoryBoard();
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
  drag(insight){
    this.droppedOutside ? this.SBInsights.splice(this.SBInsights.indexOf(insight),1) : this.droppedOutside = true;
  }
  drop(insight, index?){
    this.droppedOutside = false;
    const isInSB = this.SBInsights.indexOf(insight);
    isInSB > -1 && this.SBInsights.splice(isInSB,1);
    index > -1 ? this.SBInsights.splice(index,0,insight) : this.SBInsights.push(insight)
  }
  goStoryBoard(){
    this.showStoryBoard = true;
    setTimeout(()=>this.delayShowStoryBoard = true,2000)
  }
  storyBoardPlace(){
    this.storyBoardInsights.indexOf(this.dragCopy) === -1 ? this.storyBoardInsights.push(this.dragCopy) : this.storyBoardInsights.splice(this.storyBoardInsights.indexOf(this.dragCopy), 1)
    this.fromBank = this.dragCopy = this.draggingInsight = false;
    this.setRows();
  }

  insertDraggingInsight(dropInsight, dragInsight) {
    this.draggingInsight = this.dragCopy;
    const storyBoardInsightsIndex = this.storyBoardInsights.indexOf(dragInsight);
    const storyBoardReplaceIndex = this.storyBoardInsights.indexOf(dropInsight);
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
  openSimpleInput(callback) {
    this.dialog.open(SimpleInputComponent,{
      data:this.selectedStoryboard.storyboardName || '',
      width:'500px'
    }).afterClosed().subscribe((title) =>  title && callback(title));
  }
  saveStoryBoard() {
      this.openSimpleInput((title) => this.coreService.upsertStoryBoard({storyboardName:title, storyboardId:this.selectedStoryboard.storyboardId, insights:this.storyBoardInsights}));
  }
  deleteStoryBoard() {
    this.coreService.deleteStoryBoard(this.selectedStoryboard);
    this.delayShowStoryBoard = this.showStoryBoard = false;
  }
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



  //start spider code
  placeSpiderInsight(drop){
    this.storyBoardInsights.push(Object.assign(this.draggingInsight, {x:drop.offsetX - 105,y:drop.offsetY - 55, connections:[]}));
    this.dragCopy = this.draggingInsight =false;
  }
  expandCluster(insight) {
    if(this.startingConnection) {
      //make connection
      if(this.startingConnection !== insight) {
        this.startingConnection.connections.push(insight);
        this.startingConnection = false
      }
    } else {
      this.startingConnection = insight;
    }
    console.log(this.startingConnection)
  }
}
