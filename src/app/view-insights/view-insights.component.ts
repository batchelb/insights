import { Component, OnInit } from '@angular/core';
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
export class ViewInsightsComponent implements OnInit {

  constructor(private coreService: CoreService, private router: Router, private dialog:MatDialog) { }
  insights = [];
  filteredInsights = []
  filteredTags = [];
  attributes = ['book','chapter','verses','rating','insight','tags'];
  tags = [];
  searchText = '';
  selectedTag = '';
  showDropDown = false;
  ngOnInit() {
    this.coreService.getInsights().subscribe((insights:any) =>{
      if(insights.constructor === Array) {
        insights.forEach(insight => insight.insight.replace('script',''));
        this.filteredInsights = this.insights = insights;
      }
    });
    this.coreService.getTags().subscribe((tags:any) =>{
      this.tags = ['All'].concat(tags);
      this.filteredTags = this.tags;
    });
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
}
