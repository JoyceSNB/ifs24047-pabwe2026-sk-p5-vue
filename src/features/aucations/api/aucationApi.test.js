import { describe, expect, it, vi } from "vitest";
import * as api from "./aucationApi";
import { apiRequest } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ apiRequest: vi.fn(async () => ({ status: "success" })) }));

const payload = { title: "T", description: "D", startBid: 1000, closedAt: "2026-12-31 23:59:00" };
const body = { title: "T", description: "D", start_bid: 1000, closed_at: "2026-12-31 23:59:00" };

describe("aucationApi", () => {
  it("getAucations tanpa argumen, is_me, dan is_closed", async () => {
    await api.getAucations();
    expect(apiRequest).toHaveBeenLastCalledWith("/aucations", { params: {} });
    await api.getAucations({ isMe: true, isClosed: 0 });
    expect(apiRequest).toHaveBeenLastCalledWith("/aucations", { params: { is_me: 1, is_closed: 0 } });
  });

  it("getAucation", async () => {
    await api.getAucation(5);
    expect(apiRequest).toHaveBeenCalledWith("/aucations/5");
  });

  it("addAucation dan changeAucation", async () => {
    await api.addAucation(payload);
    expect(apiRequest).toHaveBeenLastCalledWith("/aucations", { method: "POST", body });
    await api.changeAucation(5, payload);
    expect(apiRequest).toHaveBeenLastCalledWith("/aucations/5", { method: "PUT", body });
  });

  it("changeCover mengirim FormData cover", async () => {
    await api.changeCover(5, new File(["x"], "c.png", { type: "image/png" }));
    const [path, options] = apiRequest.mock.calls[0];
    expect(path).toBe("/aucations/5/cover");
    expect(options.formData.get("cover")).toBeInstanceOf(File);
  });

  it("delete, bid, dan hapus semua", async () => {
    await api.deleteAucation(5);
    expect(apiRequest).toHaveBeenLastCalledWith("/aucations/5", { method: "DELETE" });
    await api.addBid(5, 9000);
    expect(apiRequest).toHaveBeenLastCalledWith("/aucations/5/bids", { method: "POST", body: { bid: 9000 } });
    await api.deleteBid(5);
    expect(apiRequest).toHaveBeenLastCalledWith("/aucations/5/bids", { method: "DELETE" });
    await api.deleteAllAucations();
    expect(apiRequest).toHaveBeenLastCalledWith("/aucations", { method: "DELETE" });
  });
});
