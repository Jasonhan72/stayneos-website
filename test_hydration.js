// 模拟服务器端渲染
function loadWishlist() {
  console.log("Server-side: loadWishlist() returns []");
  return [];
}

// 模拟客户端渲染
function loadWishlistClient() {
  console.log("Client-side: loadWishlist() might return ['property-1', 'property-2']");
  return ['property-1', 'property-2'];
}

// 模拟服务器渲染的HTML
const serverRendered = loadWishlist();
console.log("Server renders with wishlist:", serverRendered);

// 模拟客户端hydration
const clientWishlist = loadWishlistClient();
console.log("Client hydrates with wishlist:", clientWishlist);

if (JSON.stringify(serverRendered) !== JSON.stringify(clientWishlist)) {
  console.log("⚠️  HYDRATION MISMATCH DETECTED!");
  console.log("Server:", serverRendered);
  console.log("Client:", clientWishlist);
  console.log("\nThis will cause React hydration errors!");
}
