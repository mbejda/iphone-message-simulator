import { Component } from '@angular/core';
import { IphoneComponent } from './components/iphone/iphone.component';
import { MessageBuilderComponent } from './components/message-builder/message-builder.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [IphoneComponent, MessageBuilderComponent]
})
export class AppComponent {
}
