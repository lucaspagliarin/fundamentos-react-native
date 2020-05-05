import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productsFromStorage = await AsyncStorage.getItem(
        '@GoMarketplace:Products',
      );
      if (productsFromStorage) {
        setProducts([...JSON.parse(productsFromStorage)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Omit<Product, 'quantity'>) => {
      setProducts(oldProducts => [...oldProducts, { ...product, quantity: 1 }]);

      await AsyncStorage.setItem(
        '@GoMarketplace:Products',
        JSON.stringify([...products, product]),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const newProducts = products.map(product => {
        if (product.id === id) {
          const newProduct = { ...product, quantity: product.quantity + 1 };
          return newProduct;
        }
        return product;
      });

      setProducts(newProducts as Product[]);
      await AsyncStorage.setItem(
        '@GoMarketplace:Products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const filteredProducts = products.filter(product => product.id !== id);
      const currentProduct = products.find(product => product.id === id);
      if (currentProduct) {
        if (currentProduct.quantity <= 1) {
          setProducts([...filteredProducts]);
          await AsyncStorage.setItem(
            '@GoMarketplace:Products',
            JSON.stringify([...filteredProducts]),
          );
        } else {
          const newProducts = products.map(product => {
            if (product.id === id) {
              const newProduct = { ...product, quantity: product.quantity - 1 };
              return newProduct;
            }
            return product;
          });

          setProducts(newProducts);
          await AsyncStorage.setItem(
            '@GoMarketplace:Products',
            JSON.stringify(newProducts),
          );
        }
      } else {
        await AsyncStorage.setItem(
          '@GoMarketplace:Products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
