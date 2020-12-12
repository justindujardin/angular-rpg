import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { APP_IMPORTS } from './app.imports';
import { APP_PROVIDERS } from './app.providers';

@NgModule({
  declarations: [AppComponent],
  imports: APP_IMPORTS,
  providers: APP_PROVIDERS,
  bootstrap: [AppComponent],
})
export class AppModule {}
