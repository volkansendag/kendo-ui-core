﻿namespace Kendo.Mvc.UI.Tests.RadialGauge
{
    using Kendo.Mvc.UI;
    using Kendo.Mvc.UI.Fluent;
    using Xunit;

    public class RadialGaugeScaleTicksBuilderTests
    {
        private readonly RadialGaugeScaleMajorTicksSettings majorTicks;
        private readonly RadialGaugeScaleMajorTicksSettingsBuilder majorTicksBuilder;

        private readonly RadialGaugeScaleMinorTicksSettings minorTicks;
        private readonly RadialGaugeScaleMinorTicksSettingsBuilder minorTicksBuilder;

        public RadialGaugeScaleTicksBuilderTests()
        {
            majorTicks = new RadialGaugeScaleMajorTicksSettings();
            majorTicksBuilder = new RadialGaugeScaleMajorTicksSettingsBuilder(majorTicks);

            minorTicks = new RadialGaugeScaleMinorTicksSettings();
            minorTicksBuilder = new RadialGaugeScaleMinorTicksSettingsBuilder(minorTicks);
        }

        [Fact]
        public void Color_should_set_color_Major()
        {
            majorTicksBuilder.Color("color");
            majorTicks.Color.ShouldEqual("color");
        }

        [Fact]
        public void Width_should_set_width_Major()
        {
            majorTicksBuilder.Width(2);
            majorTicks.Width.ShouldEqual(2);
        }

        [Fact]
        public void Size_should_set_size_Major()
        {
            majorTicksBuilder.Size(2);
            majorTicks.Size.ShouldEqual(2);
        }

        [Fact]
        public void Visible_should_set_visible_Major()
        {
            majorTicksBuilder.Visible(false);
            majorTicks.Visible.ShouldEqual(false);
        }

        [Fact]
        public void DashType_should_set_dashType_Major()
        {
            majorTicksBuilder.DashType(ChartDashType.Dot);
            majorTicks.DashType.ToString().ToLowerInvariant().ShouldEqual("dot");
        }

        [Fact]
        public void Color_should_set_color_Minor()
        {
            minorTicksBuilder.Color("color");
            minorTicks.Color.ShouldEqual("color");
        }

        [Fact]
        public void Width_should_set_width_Minor()
        {
            minorTicksBuilder.Width(2);
            minorTicks.Width.ShouldEqual(2);
        }

        [Fact]
        public void Size_should_set_size_Minor()
        {
            minorTicksBuilder.Size(2);
            minorTicks.Size.ShouldEqual(2);
        }

        [Fact]
        public void Visible_should_set_visible_Minor()
        {
            minorTicksBuilder.Visible(false);
            minorTicks.Visible.ShouldEqual(false);
        }

        [Fact]
        public void DashType_should_set_dashType_Minor()
        {
            minorTicksBuilder.DashType(ChartDashType.Dot);
            minorTicks.DashType.ToString().ToLowerInvariant().ShouldEqual("dot");
        }
    }
}