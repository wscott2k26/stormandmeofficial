import React from "react";
import fs from "fs";
import path from "path";
import { renderToStaticMarkup } from "react-dom/server";
import { FEATURED_SHIRTS, FeaturedShirtCard } from "./Home";

const EXPECTED_SHIRTS = [
  {
    id: "stay-tee",
    name: "Some Things Ain't Worth It… But You Are — Stay Tee",
    category: "Featured Tee",
    price: "$34.99",
    url: "https://stormandme.printify.me/product/30324789",
    image: "/featured-merch/stay-tee.svg",
  },
  {
    id: "still-standing-tee",
    name: "The House That Pain Built — Still Standing Tee",
    category: "Featured Tee",
    price: "$34.99",
    url: "https://stormandme.printify.me/product/30324825",
    image: "/featured-merch/still-standing-tee.svg",
  },
  {
    id: "found-my-way-back-tee",
    name: "I Survived the Storm — Found My Way Back Tee",
    category: "Featured Tee",
    price: "$34.99",
    url: "https://stormandme.printify.me/product/30324848",
    image: "/featured-merch/found-my-way-back-tee.svg",
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

  test.each(EXPECTED_SHIRTS)("ships the local image for $name", (shirt) => {
    const imagePath = path.join(process.cwd(), "public", shirt.image.replace(/^\//, ""));
    expect(fs.existsSync(imagePath)).toBe(true);
    expect(fs.readFileSync(imagePath, "utf8")).toContain("<svg");
  });

  test("keeps the merch integration limited to the approved catalog", () => {
    const homeSource = fs.readFileSync(path.join(process.cwd(), "src/pages/Home.js"), "utf8");

    expect(homeSource).toContain("FEATURED_SHIRTS.map");
    expect(homeSource).toContain("grid-cols-1 sm:grid-cols-2 lg:grid-cols-3");
    expect(homeSource).toContain("Secure checkout and fulfillment through Printify.");
    expect(homeSource).not.toContain("products.slice(0, 4)");
    expect(homeSource).not.toContain("FeaturedMerchPortal");
  });
});
