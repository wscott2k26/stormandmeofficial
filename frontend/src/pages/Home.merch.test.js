import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FEATURED_SHIRTS, FeaturedShirtCard } from "./Home";

const EXPECTED_SHIRTS = [
  {
    id: "stay-tee",
    name: "Some Things Ain't Worth It… But You Are — Stay Tee",
    category: "Featured Tee",
    price: "$34.99",
    url: "https://stormandme.printify.me/product/30324789",
    image: "https://images-api.printify.com/mockup/6a63b944526af1ea540dbf2b/18230/102044/some-things-aint-worth-it-but-you-are-stay-tee.jpg?camera_label=front-2&revision=1785025198746&s=2048",
  },
  {
    id: "still-standing-tee",
    name: "The House That Pain Built — Still Standing Tee",
    category: "Featured Tee",
    price: "$34.99",
    url: "https://stormandme.printify.me/product/30324825",
    image: "https://images-api.printify.com/mockup/6a63b96a2f348356b404fed3/18230/102044/the-house-that-pain-built-still-standing-tee.jpg?camera_label=front-2&revision=1785025226555&s=2048",
  },
  {
    id: "found-my-way-back-tee",
    name: "I Survived the Storm — Found My Way Back Tee",
    category: "Featured Tee",
    price: "$34.99",
    url: "https://stormandme.printify.me/product/30324848",
    image: "https://images-api.printify.com/mockup/6a63b98a3741853e8904bd5b/18230/102044/i-survived-the-storm-found-my-way-back-tee.jpg?camera_label=front-2&revision=1785025247713&s=2048",
  },
];

describe("homepage featured shirts", () => {
  test("defines exactly the three approved shirts", () => {
    expect(FEATURED_SHIRTS).toEqual(EXPECTED_SHIRTS);
    expect(FEATURED_SHIRTS).toHaveLength(3);
    expect(FEATURED_SHIRTS.some((shirt) => /hoodie/i.test(shirt.name))).toBe(false);
  });

  test.each(EXPECTED_SHIRTS)("renders $name as a safe external product card", (shirt) => {
    const markup = renderToStaticMarkup(<FeaturedShirtCard shirt={shirt} />);

    expect(markup).toContain(`href="${shirt.url}"`);
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('rel="noreferrer"');
    expect(markup).toContain(`src="${shirt.image}"`);
    expect(markup).toContain(shirt.price);
    expect(markup).toContain("View Shirt");
  });

  test.each(EXPECTED_SHIRTS)("uses the real Printify product photo for $name", (shirt) => {
    expect(shirt.image).toMatch(/^https:\/\/images-api\.printify\.com\/mockup\//);
    expect(shirt.image).toContain("camera_label=front-2");
  });

  test("keeps the merch integration limited to the approved catalog", () => {
    const homeSource = fs.readFileSync(path.join(process.cwd(), "src/pages/Home.js"), "utf8");

    expect(homeSource).toContain("FEATURED_SHIRTS.map");
    expect(homeSource).toContain("grid-cols-1 sm:grid-cols-2 lg:grid-cols-3");
    expect(homeSource).toContain("Secure checkout and fulfillment through Printify.");
    expect(homeSource).not.toContain("products.slice(0, 4)");
    expect(homeSource).not.toContain("FeaturedMerchPortal");
    expect(homeSource).not.toContain("Official Product");
  });
});
