import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FileInputComponent } from 'ngx-material-file-input';
import { AuthService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';
import { S3Service } from 'src/app/services/s3.service';
import { IProduct } from 'src/app/types/product.interface';
import { InventoryPage } from '../1_inventory/inventory.page';

@Component({
  templateUrl: './root.page.html',
  styleUrls: ['./root.page.css']
})
// tslint:disable-next-line: component-class-suffix
export class RootPage implements OnInit {

  private inventoryPage: InventoryPage | undefined;

  public editedProduct: IProduct | null = null;

  public constructor(
    public authService: AuthService,
    public productService: ProductService,
    private route: ActivatedRoute,
    private s3: S3Service,
  ) { }

  public ngOnInit(): void {
  }

  public onActivate(page: Component): void {
    if (page instanceof InventoryPage) {
      this.inventoryPage = page;
      this.inventoryPage.edit.subscribe((product: IProduct) => this.onEdit(product));
    }
    else {
      throw new Error(`Expected argument to be of type InventoryPage but got ${page}.`);
    }
  }

  public onEdit(product: IProduct): void {
    this.editedProduct = product;
  }

  public upload(image: FileInputComponent): void {
    const file = image.value?.files[0];
    if (file) {
      this.s3.uploadRx(file).subscribe(url => this.editedProduct && (this.editedProduct.imageUrl = url));
    }
  }

  public save({ value: product }: NgForm): void {
    product.categoryId ||= this.route.snapshot.paramMap.get('categoryId');
    // tslint:disable-next-line: deprecation
    this.productService.saveProductRx(product).subscribe(() => this.inventoryPage?.touch());
  }

  public logOut(): void {
    // tslint:disable-next-line: deprecation
    this.authService.logOutRx().subscribe();
  }

}
