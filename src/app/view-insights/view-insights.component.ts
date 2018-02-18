import { Component, OnInit, AfterViewInit, ViewChild, HostListener, ChangeDetectorRef,  } from '@angular/core';
import { CoreService } from '../core.service';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { ViewDetailsComponent } from './view-details/view-details.component';

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
  attributes = ['book','chapter','verses','rating','insight','tags'];
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
  draggingInsight = false;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.ngAfterViewInit();
  }
  @HostListener('window:mouseup', ['$event'])
  mouseUp(){
    console.log('!!!!!!!!')
    this.draggingInsight && this.dragEnd();
  }

  constructor(private coreService: CoreService, private router: Router, private dialog:MatDialog, private cd:ChangeDetectorRef) { }

  ngOnInit() {
    this.coreService.getInsights().subscribe((insights:any) =>{
      if(insights.constructor === Array) {
        insights.forEach(insight => {
          insight.insight.replace('script','')
          insight.display = `${insight.book} ${insight.chapter}:${insight.verses}`
        });
        this.filteredInsights = this.insights = insights;
        this.SBInsights = this.insights;
      }
    });
    this.coreService.getTags().subscribe((tags:any) =>{
      this.tags = ['All'].concat(tags);
      this.filteredTags = this.tags;
    });
  }

  ngAfterViewInit() {
    const padding = 50;
    this.storyInsightsPerRow = Math.floor(this.storyBoard.nativeElement.clientWidth / (this.storyInsightWidth + this.dottedLineWidth + padding));
    setTimeout(()=>this.setRows());
  }
  setRows() {
    this.storyBoardRows = [];
    for(let i = 0; i < this.storyBoardInsights.length/this.storyInsightsPerRow; i++) {
      this.storyBoardRows.push(this.storyBoardInsights.slice(i*this.storyInsightsPerRow,i*this.storyInsightsPerRow + this.storyInsightsPerRow))
    }
  }

  filterInsights(){
    this.filteredInsights = this.insights.filter(insight => {
      return _.values(insight).slice(1,-1).some(value => (value && value.toString().includes(this.searchText) || insight.tags.some(tag => tag.includes(this.searchText))))
        && (insight.tags.some(tag => tag.toLowerCase().includes(this.selectedTag.toLowerCase())) || this.selectedTag === 'All');
    });
  }
  selectTag(){
    this.filteredTags = this.tags.filter(tag => tag.toLowerCase().includes(this.selectedTag.toLowerCase()));
    this.showDropDown = false;
    this.filterInsights();
  }
  updateInsight(insight){
    this.coreService.selectedInsight = insight;
    this.router.navigate(['create']);
  }
  viewInsight(insight){
    this.dialog.open(ViewDetailsComponent, {data:insight});
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
  storyBoardPlace(element){
    if(this.storyBoardInsights.indexOf(element.dragData) === -1) {
      this.storyBoardInsights.push(element.dragData);
      this.setRows();
    }
  }

  //no need
  insertDraggingInsight(dropInsight) {
    const storyBoardInsightsIndex = this.storyBoardInsights.indexOf(this.draggingInsight);
    const storyBoardReplaceIndex = this.storyBoardInsights.indexOf(dropInsight);
    this.storyBoardInsights.splice(storyBoardReplaceIndex + 1,0,this.draggingInsight);
    storyBoardInsightsIndex !== -1 && this.storyBoardInsights.splice(storyBoardInsightsIndex  + +(storyBoardInsightsIndex > storyBoardReplaceIndex),1);
    this.setRows();
    this.cd.detectChanges();
    this.cd.markForCheck();
  }

  addConnector(insight) {
    this.storyBoardInsights.splice(this.storyBoardInsights.indexOf(insight) + 1,0,{});
    this.setRows();
  }

  dragEnd(){
    console.log('>>>>>')
    this.storyBoardInsights.splice(this.storyBoardInsights.indexOf(this.draggingInsight),1);
    this.draggingInsight = false;
    this.setRows();
  }

  remove() {
    console.log('""""""""""""')
  }
}
