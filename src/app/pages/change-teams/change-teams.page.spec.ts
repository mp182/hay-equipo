import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChangeTeamsPage } from './change-teams.page';

describe('ChangeTeamsPage', () => {
  let component: ChangeTeamsPage;
  let fixture: ComponentFixture<ChangeTeamsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeTeamsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeTeamsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
