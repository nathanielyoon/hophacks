import { assertEquals, assertMatch } from "jsr:@std/assert@^1.0.0";
import { presign } from "../lib/s3.ts";
import { test } from "./test.ts";

test(presign, () => {
  assertEquals(
    presign(
      {
        S3_HOST: new URL("https://examplebucket.s3.amazonaws.com"),
        S3_ID: "AKIAIOSFODNN7EXAMPLE",
        S3_KEY: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
      },
      "test.txt",
      "GET",
      {},
      86400,
      "us-east-1",
      new Date("Fri, 24 May 2013 00:00:00 GMT"),
    ),
    "https://examplebucket.s3.amazonaws.com/test.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20130524T000000Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404",
    "from example",
  );
  assertMatch(
    presign(
      { S3_HOST: new URL("https://example.com"), S3_ID: "", S3_KEY: "" },
      "",
      "PUT",
      { "content-type": "text/plain" },
    ),
    /X-Amz-SignedHeaders=content-type%3Bhost/,
    "also headers",
  );
});
