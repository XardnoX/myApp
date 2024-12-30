import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddWidgetPageRoutingModule } from './add-widget-routing.module';

import { AddWidgetPage } from './add-widget.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddWidgetPageRoutingModule
  ],
  declarations: [AddWidgetPage]
})
export class AddWidgetPageModule {}
