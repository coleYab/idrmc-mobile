import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { formatCurrency, formatStatusLabel } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const statusColors: Record<string, string> = {
  active: "#00c853",
  paused: "#ffb703",
  cancelled: "#ff204e",
};

const chartPalette = [
  "#ff5a36",
  "#91e9ff",
  "#9cff57",
  "#ffd8f8",
  "#ff7a59",
  "#4b7f20",
];

const monthQuarterLabel = (value: string) => {
  const parsedDate = dayjs(value);
  if (!parsedDate.isValid()) return "Unknown";

  const quarter = Math.floor(parsedDate.month() / 3) + 1;
  return `Q${quarter} ${parsedDate.year()}`;
};

const quarterSortKey = (value: string) => {
  const parsedDate = dayjs(value);
  if (!parsedDate.isValid()) return Number.POSITIVE_INFINITY;

  const quarter = Math.floor(parsedDate.month() / 3) + 1;
  return parsedDate.year() * 10 + quarter;
};

const getMonthlyEquivalent = (subscription: Subscription) =>
  subscription.billing === "Yearly"
    ? subscription.price / 12
    : subscription.price;

const Insights = () => {
  const subscriptions = useMemo(
    () =>
      HOME_SUBSCRIPTIONS.map((subscription) => ({
        ...subscription,
        monthlyEquivalent: getMonthlyEquivalent(subscription),
      })),
    [],
  );

  const summary = useMemo(() => {
    const totalMonthlyEquivalent = subscriptions.reduce(
      (total, subscription) => total + subscription.monthlyEquivalent,
      0,
    );

    const totalAnnualizedSpend = totalMonthlyEquivalent * 12;
    const activeCount = subscriptions.filter(
      (subscription) => subscription.status === "active",
    ).length;
    const upcomingRenewal = [...subscriptions]
      .filter((subscription) => Boolean(subscription.renewalDate))
      .sort(
        (left, right) =>
          dayjs(left.renewalDate).valueOf() -
          dayjs(right.renewalDate).valueOf(),
      )[0];

    const averageMonthlySpend = totalMonthlyEquivalent / subscriptions.length;

    return {
      totalMonthlyEquivalent,
      totalAnnualizedSpend,
      activeCount,
      averageMonthlySpend,
      upcomingRenewal,
    };
  }, [subscriptions]);

  const categoryData = useMemo(() => {
    const totals = new Map<string, number>();

    subscriptions.forEach((subscription) => {
      const key = subscription.category?.trim() || "Uncategorized";
      totals.set(key, (totals.get(key) || 0) + subscription.monthlyEquivalent);
    });

    return [...totals.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value);
  }, [subscriptions]);

  const statusData = useMemo(() => {
    const totals = new Map<string, number>();

    subscriptions.forEach((subscription) => {
      const key = subscription.status || "unknown";
      totals.set(key, (totals.get(key) || 0) + 1);
    });

    return [...totals.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => {
        const order = ["active", "paused", "cancelled", "unknown"];
        return order.indexOf(left.label) - order.indexOf(right.label);
      });
  }, [subscriptions]);

  const billingData = useMemo(() => {
    const monthly = subscriptions
      .filter((subscription) => subscription.billing === "Monthly")
      .reduce((total, subscription) => total + subscription.price, 0);

    const yearly = subscriptions
      .filter((subscription) => subscription.billing === "Yearly")
      .reduce((total, subscription) => total + subscription.price, 0);

    return [
      { label: "Monthly", value: monthly },
      { label: "Yearly", value: yearly },
    ];
  }, [subscriptions]);

  const timelineData = useMemo(() => {
    const totals = new Map<string, number>();

    subscriptions.forEach((subscription) => {
      if (!subscription.startDate) return;

      const key = monthQuarterLabel(subscription.startDate);
      totals.set(key, (totals.get(key) || 0) + subscription.monthlyEquivalent);
    });

    return [...totals.entries()]
      .map(([label, value]) => ({
        label,
        value,
        order: quarterSortKey(
          subscriptions.find(
            (subscription) =>
              monthQuarterLabel(subscription.startDate || "") === label,
          )?.startDate || "",
        ),
      }))
      .sort((left, right) => left.order - right.order);
  }, [subscriptions]);

  const topSubscriptions = useMemo(
    () =>
      [...subscriptions]
        .sort((left, right) => right.monthlyEquivalent - left.monthlyEquivalent)
        .slice(0, 3),
    [subscriptions],
  );

  const maxCategoryValue = Math.max(
    ...categoryData.map((item) => item.value),
    1,
  );
  const maxTimelineValue = Math.max(
    ...timelineData.map((item) => item.value),
    1,
  );
  const maxBillingValue = Math.max(...billingData.map((item) => item.value), 1);
  const totalStatusCount = Math.max(
    statusData.reduce((total, item) => total + item.value, 0),
    1,
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="insights-scroll"
        contentContainerClassName="insights-content"
        showsVerticalScrollIndicator={false}
      >
        <View className="insights-hero">
          <Text className="insights-title">Insights</Text>
          <Text className="insights-subtitle">
            A visual snapshot of spend, billing mix, status, and subscription
            growth.
          </Text>
        </View>

        <View className="insights-kpi-grid flex-col gap-4">
          {/* Row 1 */}
          <View className="flex-row gap-4">
            <View className="insights-kpi-card flex-1">
              <Text className="insights-kpi-label">Monthly spend</Text>
              <Text className="insights-kpi-value">
                {formatCurrency(summary.totalMonthlyEquivalent)}
              </Text>
              <Text className="insights-kpi-copy">
                Normalized recurring cost
              </Text>
            </View>

            <View className="insights-kpi-card flex-1">
              <Text className="insights-kpi-label">Annualized</Text>
              <Text className="insights-kpi-value">
                {formatCurrency(summary.totalAnnualizedSpend)}
              </Text>
              <Text className="insights-kpi-copy">Projected yearly spend</Text>
            </View>
          </View>

          {/* Row 2 */}
          <View className="flex-row gap-4">
            <View className="insights-kpi-card flex-1">
              <Text className="insights-kpi-label">Active subs</Text>
              <Text className="insights-kpi-value">{summary.activeCount}</Text>
              <Text className="insights-kpi-copy">Currently on plan</Text>
            </View>

            <View className="insights-kpi-card flex-1">
              <Text className="insights-kpi-label">Avg / month</Text>
              <Text className="insights-kpi-value">
                {formatCurrency(summary.averageMonthlySpend)}
              </Text>
              <Text className="insights-kpi-copy">
                Next renewal:{" "}
                {summary.upcomingRenewal?.renewalDate
                  ? dayjs(summary.upcomingRenewal.renewalDate).format("MMM D")
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        <View className="insights-card">
          <View className="insights-card-head">
            <View>
              <Text className="insights-card-title">Spend by category</Text>
              <Text className="insights-card-note">
                Monthly equivalent spend grouped by category.
              </Text>
            </View>
          </View>

          <View className="insights-chart-stack">
            {categoryData.map((item, index) => {
              const widthPercentage = `${(item.value / maxCategoryValue) * 100}%`;

              return (
                <View key={item.label} className="insights-bar-row">
                  <View className="insights-bar-label-row">
                    <Text className="insights-bar-label">{item.label}</Text>
                    <Text className="insights-bar-value">
                      {formatCurrency(item.value)}
                    </Text>
                  </View>
                  <View className="insights-bar-track">
                    <View
                      className="insights-bar-fill"
                      style={{
                        width: widthPercentage,
                        backgroundColor:
                          chartPalette[index % chartPalette.length],
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View className="insights-card">
          <View className="insights-card-head">
            <View>
              <Text className="insights-card-title">Status distribution</Text>
              <Text className="insights-card-note">
                A stacked diagram of active, paused, and cancelled
                subscriptions.
              </Text>
            </View>
          </View>

          <View className="insights-stack-track">
            {statusData.map((item, index) => {
              const segmentWidth = `${(item.value / totalStatusCount) * 100}%`;
              const segmentColor =
                statusColors[item.label] ||
                chartPalette[index % chartPalette.length];

              return (
                <View
                  key={item.label}
                  className="insights-stack-segment"
                  style={{ width: segmentWidth, backgroundColor: segmentColor }}
                />
              );
            })}
          </View>

          <View className="insights-legend-grid mt-4">
            {statusData.map((item, index) => (
              <View key={item.label} className="insights-legend-chip">
                <View
                  className="insights-legend-dot"
                  style={{
                    backgroundColor:
                      statusColors[item.label] ||
                      chartPalette[index % chartPalette.length],
                  }}
                />
                <Text className="insights-legend-copy">
                  {formatStatusLabel(item.label)} · {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="insights-card">
          <View className="insights-card-head">
            <View>
              <Text className="insights-card-title">Billing mix</Text>
              <Text className="insights-card-note">
                Actual subscription cost split between monthly and yearly
                billing.
              </Text>
            </View>
          </View>

          <View className="insights-column-chart">
            {billingData.map((item, index) => {
              const heightPercentage = `${(item.value / maxBillingValue) * 100}%`;

              return (
                <View key={item.label} className="insights-column">
                  <View className="insights-column-track">
                    <View
                      className="insights-column-fill"
                      style={{
                        height: heightPercentage,
                        backgroundColor:
                          chartPalette[index % chartPalette.length],
                      }}
                    />
                  </View>
                  <Text className="insights-column-label">{item.label}</Text>
                  <Text className="insights-column-value">
                    {formatCurrency(item.value)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View className="insights-card">
          <View className="insights-card-head">
            <View>
              <Text className="insights-card-title">
                Subscription start timeline
              </Text>
              <Text className="insights-card-note">
                Quarter-based adoption chart showing when each plan began.
              </Text>
            </View>
          </View>

          <View className="insights-column-chart">
            {timelineData.map((item, index) => {
              const heightPercentage = `${(item.value / maxTimelineValue) * 100}%`;

              return (
                <View key={item.label} className="insights-column">
                  <View className="insights-column-track">
                    <View
                      className="insights-column-fill"
                      style={{
                        height: heightPercentage,
                        backgroundColor:
                          chartPalette[(index + 2) % chartPalette.length],
                      }}
                    />
                  </View>
                  <Text className="insights-column-label">{item.label}</Text>
                  <Text className="insights-column-value">
                    {formatCurrency(item.value)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View className="insights-card mb-16">
          <View className="insights-card-head">
            <View>
              <Text className="insights-card-title">Top subscriptions</Text>
              <Text className="insights-card-note">
                Highest normalized monthly cost across the current portfolio.
              </Text>
            </View>
          </View>

          <View className="insights-list mb-2">
            {topSubscriptions.map((subscription, index) => (
              <View key={subscription.id} className="insights-list-row">
                <View className="insights-list-copy">
                  <Text className="insights-list-title">
                    {index + 1}. {subscription.name}
                  </Text>
                  <Text className="insights-list-subtitle">
                    {subscription.category ||
                      subscription.plan ||
                      "Uncategorized"}{" "}
                    · {subscription.billing}
                  </Text>
                </View>

                <Text className="insights-list-value">
                  {formatCurrency(subscription.monthlyEquivalent)} / mo
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;
