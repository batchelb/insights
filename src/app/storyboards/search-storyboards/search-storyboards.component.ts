import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../core.service';
@Component({
  selector: 'app-search-storyboards',
  templateUrl: './search-storyboards.component.html',
  styleUrls: ['./search-storyboards.component.less']
})
export class SearchStoryboardsComponent implements OnInit {
  storyboards = [];
  constructor(private coreService: CoreService) { }

  ngOnInit() {
    this.coreService.getStoryBoards().subscribe((storyboards:any)=>{
      this.storyboards = storyboards;
    })
  }

}
