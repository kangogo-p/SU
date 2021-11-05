import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { merge } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ProductService } from 'src/app/services/product.service';
import { IProduct } from 'src/app/types/product.interface';

@Component({
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.css']
})
// tslint:disable-next-line: component-class-suffix
export class InventoryPage implements OnInit {

  private readonly dataChange$ = new EventEmitter();

  @Output() edit = new EventEmitter<IProduct>();

  public readonly allCategories$ = this.productService.getAllCategoriesRx().pipe(
    // Don't show the 'all' category in admin mode because it makes the (+) button ambiguous.
    map(categories => categories.filter(({ _id }) => _id !== 'all')),
    // If :categoryId is not a valid category ID, navigate to the first category.
    tap(categories => (
      categories.map(({ _id }) => _id).includes(this.getCategoryId()) ||
      this.router.navigate(['..', categories[0]._id], { relativeTo: this.route })
    )),
  );

  /**
   * Emits an array of products whenever one of the following happens:
   * (1) the category changes or
   * (2) a product is added or modified by the user.
   */
  public readonly allProductsInCategory$ = merge<ParamMap>(this.route.paramMap, this.dataChange$).pipe(
    switchMap(paramMap => this.productService.getAllProductsInCategoryRx(
      paramMap?.get('categoryId') || this.getCategoryId()
    )),
  );

  public constructor(
    public productService: ProductService,
    public router: Router,
    private route: ActivatedRoute,
  ) { }

  public ngOnInit(): void {
  }

  public onEdit(product: IProduct | null): void {
    this.edit.emit(product || {
      _id: '',
      name: '',
      price: 0,
      imageUrl: '/assets/missing-image.png',
      categoryId: this.getCategoryId(),
    });
  }

  public touch(): void {
    this.dataChange$.emit();
  }

  public getCategoryId(): string {
    return this.route.snapshot.paramMap.get('categoryId') || '';
  }

}
