import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '../core.service';

@Component({
  selector: 'app-create-insight',
  templateUrl: './create-insight.component.html',
  styleUrls: ['./create-insight.component.less'],
})
export class CreateInsightComponent implements OnInit, OnDestroy {
  @ViewChild('dropdown') dropdown;
  layout= {
    true:{
      first:'Book',
      second:'Chapter',
      third:'Verses',
      buttonColor:'primary'
    },
    false:{
      first:'Talk',
      second:'Author',
      third:'Quote',
      buttonColor:'secondary'
    }
  }
  tags;
  filteredTags = this.tags;
  loading;
  tagValue;
  selectedTags = [];
  selectedTagIndex = -1;
  isRatingActive = false;
  isScripture:any = true;
  insights = [];
  chosenMarker = 3;
  showDropDown = false;
  calcMarker = "calc(" + this.chosenMarker * 10  + "% - 12px)";
  books = [{book:'Genesis',chapters:50},{book:'Exodus',chapters:40},{book:'Leviticus',chapters:27},{book:'Numbers',chapters:36},{book:'Deuteronomy',chapters:34},{book:'Joshua',chapters:24},{book:'Judges',chapters:21},{book:'Ruth',chapters:4},{book:'1 Samuel',chapters:31},{book:'2 Samuel',chapters:24},{book:'1 Kings',chapters:22},{book:'2 Kings',chapters:25},{book:'1 Chronicles',chapters:29},{book:'2 Chronicles',chapters:36},{book:'Ezra',chapters:10},{book:'Nehemiah',chapters:13},{book:'Esther',chapters:10},{book:'Job',chapters:42},{book:'Psalm',chapters:150},{book:'Proverbs',chapters:31},{book:'Ecclesiastes',chapters:12},{book:'Song of Solomon',chapters:8},{book:'Isaiah',chapters:66},{book:'Jeremiah',chapters:52},{book:'Lamentations',chapters:5},{book:'Ezekiel',chapters:48},{book:'Daniel',chapters:12},{book:'Hosea',chapters:14},{book:'Joel',chapters:3},{book:'Amos',chapters:9},{book:'Obadiah',chapters:1},{book:'Jonah',chapters:4},{book:'Micah',chapters:7},{book:'Nahum',chapters:3},{book:'Habakkuk',chapters:3},{book:'Zephaniah',chapters:3},{book:'Haggai',chapters:2},{book:'Zechariah',chapters:14},{book:'Malachi',chapters:4},{book:'Matthew',chapters:28},{book:'Mark',chapters:16},{book:'Luke',chapters:24},{book:'John',chapters:21},{book:'Acts',chapters:28},{book:'Romans',chapters:16},{book:'1 Corinthians',chapters:16},{book:'2 Corinthians',chapters:13},{book:'Galatians',chapters:6},{book:'Ephesians',chapters:6},{book:'Philippians',chapters:4},{book:'Colossians',chapters:4},{book:'1 Thessalonians',chapters:5},{book:'2 Thessalonians',chapters:3},{book:'1 Timothy',chapters:6},{book:'2 Timothy',chapters:4},{book:'Titus',chapters:3},{book:'Philemon',chapters:1},{book:'Hebrews',chapters:13},{book:'James',chapters:5},{book:'1 Peter',chapters:5},{book:'2 Peter',chapters:3},{book:'1 John',chapters:5},{book:'2 John',chapters:1},{book:'3 John',chapters:1},{book:'Jude',chapters:1},{book:'Revelation',chapters:22},{book:'1 Nephi',chapters:22},{book:'2 Nephi',chapters:33},{book:'Jacob',chapters:7},{book:'Enos',chapters:1},{book:'Jarom',chapters:1},{book:'Omni',chapters:1},{book:'Words of Mormon',chapters:1},{book:'Mosiah',chapters:29},{book:'Alma',chapters:63},{book:'Helaman',chapters:16},{book:'3 Nephi',chapters:30},{book:'4 Nephi',chapters:1},{book:'Mormon',chapters:9},{book:'Ether',chapters:15},{book:'Moroni',chapters:10},{book:'Moses',chapters:8},{book:'Abraham',chapters:5},{book:'Joseph Smith - Mattew',chapters:1},{book:'Joseph Smith - History',chapters:1},{book:'The Articles of Faith',chapters:1},{book:'D&C',chapters:138}];
  filteredBooks =[];
  filteredChapters = [];
  chapters = [];
  value;
  scriptures;
  displayBook ='';
  displayChapter = '';
  displayVerse:any = '';
  displayContent:any = '';
  selectedInsight:any = {};
  toolbar = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      ['link', 'image', 'video']                         // link and image, video
    ]
  };
  constructor(private coreService: CoreService, private cd:ChangeDetectorRef, private router:Router) { }
  ngOnInit() {
    if(this.coreService.selectedInsight.insightId) {
      this.selectedInsight = this.coreService.selectedInsight;
      this.selectedTags = this.selectedInsight.tags;
      this.displayVerse = this.selectedInsight.verses
      this.displayChapter = this.selectedInsight.chapter;
      this.displayBook = this.selectedInsight.book;
      this.setUpChapters(this.displayBook);
      this.dragOver(this.selectedInsight.rating);
    }
    this.coreService.getTags().subscribe(tags => this.tags = tags);
  }

  filterChapters(input){
    this.displayChapter = input;
    this.changeDisplay();
  }

  setUpChapters(book:any) {
    this.filteredBooks = this.books.filter(bk => bk.book.toLowerCase().includes(book.toLowerCase()));
    book = this.books.find(bk => book.toLowerCase() === bk.book.toLowerCase()) || {};
    this.displayBook = book.book || '';
    this.changeDisplay();
  }
  changeDisplay(){
    this.displayContent = this.coreService.getScriptures(this.displayBook,this.displayChapter,this.displayVerse);
  }

  setVerses(verses){
    this.displayVerse = verses;
    this.changeDisplay();
  }

  changeTag(key){
    this.showDropDown = true;
    switch(key){
      case "ArrowDown":
        this.selectedTagIndex !== this.filteredTags.length -1 && this.selectedTagIndex++;
        this.tagValue = this.filteredTags[this.selectedTagIndex];
        if(this.selectedTagIndex > 3 && this.selectedTagIndex < this.filteredTags.length - 3) {
          this.dropdown.nativeElement.scrollTop += 48;
        }
        break;
      case "ArrowUp":
        this.selectedTagIndex && this.selectedTagIndex--;
        this.tagValue = this.filteredTags[this.selectedTagIndex];
        if(this.selectedTagIndex >= 3 && this.selectedTagIndex < this.filteredTags.length - 4) {
          this.dropdown.nativeElement.scrollTop -= 48;
        }
        break;
      case "Enter":
        this.tagValue && this.selectedTags.every(tag => tag !== this.tagValue)&& this.selectedTags.push(this.tagValue);
        this.tagValue = '';
        this.selectedTagIndex = -1;
        this.filterTags(false);
        break
      }
  }
  filterTags(showDropDown) {
    this.showDropDown = showDropDown;
    this.filteredTags = this.tags.filter(tag => tag.toLowerCase().includes(this.tagValue) && this.selectedTags.every(selectedTag => selectedTag !== tag));
  }
  submit(insight){
    insight.insightId = this.selectedInsight.insightId
    insight.tags = this.selectedTags;
    this.tagValue && insight.tags.push(this.tagValue);
    insight.rating = this.chosenMarker;
    this.insights.push(insight);
    this.coreService.createInsight(insight).subscribe(()=> this.router.navigate(['view']));
  }
  focusOut() {
    setTimeout(()=>this.showDropDown = false,200)
  }
  dragOver(newChosen){
    this.chosenMarker=newChosen;
    this.calcMarker="calc(" + this.chosenMarker * 10  + "% - 12px)";
    this.cd.detectChanges();
    this.cd.markForCheck();
  }
  ngOnDestroy(){
    this.coreService.selectedInsight = {};
  }
}
